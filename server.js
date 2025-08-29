const express = require("express");
const axios = require("axios");
const fs = require("fs-extra");
const yauzl = require("yauzl");
const path = require("path");
const jsonDiff = require("json-diff");
const jp = require("jsonpath");
const Anthropic = require("@anthropic-ai/sdk");

const anthropic = new Anthropic({
	apiKey:
		"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",
});

const app = express();
app.use(express.json());

const ACCESS_TOKEN =
	"eyJhbGciOiJBMjU2S1ciLCJlbmMiOiJBMjU2R0NNIn0.nczOsPYlstdkTDz5wu99rZ5913JhnKWf0AyVS3rdIRxgRIXWRWky0g.WfEFlWwo9STCZFmn.vD7fPd2YKHRkfMeDZtxkF8FfnSO14FkqOBOJNtMNVTGFfz6TpVFwomk-fEirFbdIsCwGs_rWlsGaMiaUAc7fYd6R3_Tow6SypwgUCyuM5wTtJ1sFTOiHyV5LMLCzBnvTYkV6OxgkSHw.lv2pYiYHThm4aI6c8CNA8Q";

// Функция экспорта файла из Penpot
async function exportPenpotFile(fileId) {
	console.log(`Начинаем экспорт файла: ${fileId}`);

	const downloadDir = path.join(__dirname, "history");
	await fs.ensureDir(downloadDir);

	const payload = {
		fileId: fileId,
		includeLibraries: true,
		embedAssets: false,
		version: 3,
	};

	try {
		const response = await axios.post(
			"https://design.penpot.app/api/rpc/command/export-binfile",
			payload,
			{
				headers: {
					Authorization: `Token ${ACCESS_TOKEN}`,
					"Content-Type": "application/json",
					Accept: "application/json",
				},
				responseType: "arraybuffer",
				timeout: 60000,
			},
		);

		console.log(`Файл загружен, размер: ${response.data.length} байт`);

		const zipPath = path.join(downloadDir, `${fileId}.penpot`);
		await fs.writeFile(zipPath, response.data);

		const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
		const extractDir = path.join(downloadDir, `${fileId}-extract-${timestamp}`);
		await fs.ensureDir(extractDir);
		await unpackZip(zipPath, extractDir);

		await processExtractedFiles(extractDir, fileId);

		console.log(`Экспорт файла ${fileId} завершен`);
		return true;
	} catch (error) {
		console.log(`Ошибка экспорта файла ${fileId}:`, error.message);
		return false;
	}
}

// Функция распаковки ZIP
function unpackZip(zipPath, extractDir) {
	return new Promise((resolve, reject) => {
		yauzl.open(zipPath, { lazyEntries: true }, (err, zipfile) => {
			if (err) return reject(err);

			zipfile.readEntry();
			zipfile.on("entry", (entry) => {
				if (/\/$/.test(entry.fileName)) {
					zipfile.readEntry();
				} else {
					zipfile.openReadStream(entry, (err, readStream) => {
						if (err) return reject(err);

						const filePath = path.join(extractDir, entry.fileName);
						fs.ensureDirSync(path.dirname(filePath));

						const writeStream = fs.createWriteStream(filePath);
						readStream.pipe(writeStream);

						writeStream.on("close", () => {
							zipfile.readEntry();
						});
					});
				}
			});

			zipfile.on("end", () => {
				console.log(`Архив распакован в: ${extractDir}`);
				resolve();
			});
		});
	});
}

// Функция обработки извлеченных файлов
async function processExtractedFiles(extractDir, fileId) {
	const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
	const timestampedDir = path.join(
		__dirname,
		"history",
		`${fileId}-extract-${timestamp}`,
	);

	// Переименовываем папку с timestamp
	await fs.move(extractDir, timestampedDir);

	const fullJsonPath = path.join(timestampedDir, "full.json");
	const flatItems = {};

	const treeData = await buildJsonTree(
		timestampedDir,
		timestampedDir,
		flatItems,
	);

	await fs.writeJson(fullJsonPath, treeData, { spaces: 2 });

	console.log(`Создан объединенный файл: ${fullJsonPath}`);
	console.log(`Всего объектов обработано: ${Object.keys(flatItems).length}`);

	// Сравниваем с предыдущей версией
	await compareWithPrevious(fileId, treeData);

	const simplifiedData = transformPenpotData(treeData);
	const simplifiedJsonPath = path.join(timestampedDir, "simplified.json");
	await fs.writeJson(simplifiedJsonPath, simplifiedData, { spaces: 2 });

	console.log(`Создан упрощенный файл: ${simplifiedJsonPath}`);
	console.log(`Найдено компонентов: ${simplifiedData.components.length}`);

	// Генерируем компоненты и Storybook
	try {
		await generateComponentsFromSimplified(timestampedDir, fileId);
	} catch (error) {
		console.log(`Ошибка создания компонентов: ${error.message}`);
	}

	// Генерируем AST
	// try {
	// 	const astData = await generateASTWithClaude(simplifiedData);
	// 	const astJsonPath = path.join(timestampedDir, "ast.json");
	// 	await fs.writeFile(astJsonPath, astData);
	// 	console.log(`Создан AST файл: ${astJsonPath}`);
	// } catch (error) {
	// 	console.log(`Ошибка создания AST: ${error.message}`);
	// }
}

// Рекурсивное чтение JSON файлов
async function buildJsonTree(basePath, rootPath, flatItems) {
	const result = {};

	try {
		const items = await fs.readdir(basePath);

		for (const item of items) {
			const fullPath = path.join(basePath, item);
			const stat = await fs.stat(fullPath);

			if (stat.isDirectory()) {
				result[item] = await buildJsonTree(fullPath, rootPath, flatItems);
			} else if (path.extname(item) === ".json" && item !== "full.json") {
				try {
					const content = await fs.readJson(fullPath);
					result[item] = content;

					if (content && typeof content === "object" && content.id) {
						flatItems[content.id] = content;
					}
				} catch (e) {
					console.log(`Не удалось прочитать JSON файл ${fullPath}:`, e.message);
				}
			}
		}
	} catch (e) {
		console.log(`Ошибка чтения директории ${basePath}:`, e.message);
	}

	return result;
}

// Функция сравнения файлов
async function compareWithPrevious(fileId, currentData) {
	const historyDir = path.join(__dirname, "history");
	const previousFiles = await fs.readdir(historyDir);

	// Ищем предыдущую версию этого файла
	const previousExtracts = previousFiles
		.filter((name) => name.startsWith(`${fileId}-extract-`))
		.sort()
		.reverse();

	if (previousExtracts.length === 0) {
		console.log("Предыдущих версий файла не найдено");
		return;
	}

	if (previousExtracts.length < 2) {
		console.log("Недостаточно версий для сравнения");
		return;
	}
	const previousExtractDir = path.join(historyDir, previousExtracts[1]);
	const previousJsonPath = path.join(previousExtractDir, "full.json");

	try {
		const previousData = await fs.readJson(previousJsonPath);
		const differences = jsonDiff.diff(previousData, currentData);

		if (differences) {
			console.log("\n🔍 ОБНАРУЖЕНЫ ИЗМЕНЕНИЯ:");
			console.log(JSON.stringify(differences, null, 2));
		} else {
			console.log("\nИзменений не обнаружено");
		}
	} catch (error) {
		console.log("Ошибка при сравнении:", error.message);
	}
}

// Функция трансформации Penpot данных в упрощенную схему
function transformPenpotData(fullData) {
	const result = {
		components: [],
		metadata: {
			fileName: "UI Components",
			version: "1.0",
			extractedAt: new Date().toISOString(),
		},
	};

	const activeComponents = jp
		.query(fullData, "$..files.*.components.*")
		.filter(
			(comp) =>
				!comp.deleted &&
				!comp.objects &&
				comp.mainInstanceId &&
				comp.id &&
				comp.name,
		);

	console.log(`Найдено активных компонентов: ${activeComponents.length}`);

	for (const componentMeta of activeComponents) {
		const mainInstance = jp.query(
			fullData,
			`$..pages.*['${componentMeta.mainInstanceId}.json']`,
		)[0];

		if (!mainInstance) continue;

		const transformedComponent = {
			id: generateComponentId(componentMeta),
			name: componentMeta.name,
			path: componentMeta.path,
			type: mainInstance.type,
			layout: extractLayoutData(mainInstance),
			dimensions: {
				width: mainInstance.width,
				height: mainInstance.height,
			},
			styling: extractStylingData(mainInstance),
			children: extractChildren(fullData, mainInstance),
		};

		result.components.push(transformedComponent);
	}

	return result;
}

function generateComponentId(componentMeta) {
	return (
		componentMeta.path
			.toLowerCase()
			.replace(/\s+/g, "-")
			.replace(/[^a-z0-9-]/g, "") +
		"-" +
		componentMeta.name.toLowerCase().replace(/\s+/g, "-")
	);
}

// Извлечение layout данных
function extractLayoutData(obj) {
	return {
		type: obj.layout || "auto",
		direction: obj.layoutFlexDir || "row",
		alignItems: obj.layoutAlignItems || "start",
		justifyContent: obj.layoutJustifyContent || "start",
		padding: obj.layoutPadding
			? {
					top: obj.layoutPadding.p1 || 0,
					right: obj.layoutPadding.p2 || 0,
					bottom: obj.layoutPadding.p3 || 0,
					left: obj.layoutPadding.p4 || 0,
				}
			: { top: 0, right: 0, bottom: 0, left: 0 },
		gap: obj.layoutGap
			? {
					row: obj.layoutGap.rowGap || 0,
					column: obj.layoutGap.columnGap || 0,
				}
			: { row: 0, column: 0 },
	};
}

// Извлечение стилей
function extractStylingData(obj) {
	const styling = {
		borderRadius: {
			topLeft: obj.r1 || 0,
			topRight: obj.r2 || 0,
			bottomRight: obj.r3 || 0,
			bottomLeft: obj.r4 || 0,
		},
		fills: obj.fills
			? obj.fills.map((fill) => ({
					color: fill.fillColor,
					opacity: fill.fillOpacity || 1,
				}))
			: [],
		strokes: obj.strokes
			? obj.strokes.map((stroke) => ({
					color: stroke.strokeColor,
					width: stroke.strokeWidth || 1,
					style: stroke.strokeStyle || "solid",
					alignment: stroke.strokeAlignment || "center",
				}))
			: [],
	};

	// Добавляем тени если есть
	if (obj.shadow && obj.shadow.length > 0) {
		styling.shadow = obj.shadow.map((shadow) => ({
			color: shadow.color.color,
			opacity: shadow.color.opacity,
			offsetX: shadow.offsetX || 0,
			offsetY: shadow.offsetY || 0,
			blur: shadow.blur || 0,
			spread: shadow.spread || 0,
			type: shadow.style || "drop-shadow",
		}));
	}

	return styling;
}

// Извлечение дочерних элементов
function extractChildren(fullData, mainInstance) {
	if (!mainInstance.shapes) return [];

	return mainInstance.shapes
		.map((shapeId) => {
			const childObj = jp.query(fullData, `$..pages.*['${shapeId}.json']`)[0];
			if (!childObj) return null;

			const child = {
				id: childObj.name.toLowerCase().replace(/\s+/g, "-"),
				name: childObj.name,
				type: childObj.type,
				dimensions: { width: childObj.width, height: childObj.height },
			};

			if (childObj.type === "text" && childObj.content) {
				child.content = extractTextContent(childObj.content);
				child.typography = extractTypography(childObj.content);
			}

			if (childObj.type === "frame" && childObj.shapes) {
				child.layout = extractLayoutData(childObj);
				child.styling = extractStylingData(childObj);
				child.children = extractChildren(fullData, childObj);
			}

			return child;
		})
		.filter(Boolean);
}

// Извлечение текстового контента
function extractTextContent(content) {
	if (!content.children) return "";

	let text = "";
	content.children.forEach((paragraphSet) => {
		if (paragraphSet.children) {
			paragraphSet.children.forEach((paragraph) => {
				if (paragraph.children) {
					paragraph.children.forEach((textNode) => {
						if (textNode.text) {
							text += textNode.text;
						}
					});
				}
			});
		}
	});

	return text;
}

// Извлечение типографики
function extractTypography(content) {
	const firstTextNode = jp.query(
		content,
		"$..children[0].children[0].children[0]",
	)[0];

	if (!firstTextNode) return {};

	return {
		fontFamily: firstTextNode.fontFamily,
		fontSize: Number.parseInt(firstTextNode.fontSize) || 14,
		fontWeight: Number.parseInt(firstTextNode.fontWeight) || 400,
		lineHeight: Number.parseFloat(firstTextNode.lineHeight) || 1.5,
		textAlign: firstTextNode.textAlign || "left",
		color:
			firstTextNode.fills && firstTextNode.fills[0]
				? firstTextNode.fills[0].fillColor
				: "#000000",
	};
}

// Функция для генерации simplified.json из последнего извлеченного файла
async function generateSimplifiedFromLatest(fileId) {
	const historyDir = path.join(__dirname, "history");

	try {
		const extractDirs = (await fs.readdir(historyDir))
			.filter((name) => name.startsWith(`${fileId}-extract-`))
			.sort()
			.reverse();

		if (extractDirs.length === 0) {
			throw new Error(`Не найдено извлеченных файлов для ${fileId}`);
		}

		const latestExtractDir = path.join(historyDir, extractDirs[0]);
		const fullJsonPath = path.join(latestExtractDir, "full.json");

		if (!(await fs.pathExists(fullJsonPath))) {
			throw new Error(`Файл full.json не найден в ${latestExtractDir}`);
		}

		const treeData = await fs.readJson(fullJsonPath);
		const simplifiedData = transformPenpotData(treeData);
		const simplifiedJsonPath = path.join(latestExtractDir, "simplified.json");

		await fs.writeJson(simplifiedJsonPath, simplifiedData, { spaces: 2 });

		console.log(`Обновлен упрощенный файл: ${simplifiedJsonPath}`);
		console.log(`Найдено компонентов: ${simplifiedData.components.length}`);

		return true;
	} catch (error) {
		console.error(`Ошибка генерации simplified.json:`, error.message);
		return false;
	}
}

// Функция генерации AST через Claude
async function generateASTWithClaude(simplifiedData) {
	const prompt = `
Задача: Создай AST (Abstract Syntax Tree) на основе данных UI компонентов из Penpot.

Входные данные:
${JSON.stringify(simplifiedData, null, 2)}

Требования к AST:
- Структурированное представление компонентов для генерации React компонентов
- Включить все layout, styling, dimensions данные
- Сохранить иерархию children
- Подготовить метаданные для каждого элемента

Верни только валидный JSON AST без дополнительных объяснений и без markdown форматирования.
`;

	console.log("Генерируем AST через Claude API...");

	try {
		const message = await anthropic.messages.create({
			model: "claude-sonnet-4-20250514",
			max_tokens: 4000,
			messages: [
				{
					role: "user",
					content: [{ type: "text", text: prompt }],
				},
			],
		});

		const textContent = message.content.find(
			(content) => content.type === "text",
		);
		const rawResponse = textContent?.text || "No AST generated";

		const cleanedResponse = rawResponse
			.replace(/```json\s*/g, "")
			.replace(/```\s*/g, "")
			.trim();

		return cleanedResponse;
	} catch (error) {
		console.error("Ошибка генерации AST через Claude:", error.message);
		throw error;
	}
}

// Функция генерации React компонента через Claude
async function generateReactComponentWithClaude(componentData, componentName) {
	const prompt = `
Создай React компонент на основе этих данных из Penpot:

Данные компонента:
${JSON.stringify(componentData, null, 2)}

Требования:
1. Компонент должен называться ${componentName}
2. Используй современный React с функциональными компонентами
3. Используй inline стили на основе данных styling и layout
4. Включи поддержку пропсов для настройки
5. Экспортируй компонент как default export

Формат ответа: только код React компонента без markdown форматирования.
`;

	try {
		const message = await anthropic.messages.create({
			model: "claude-sonnet-4-20250514",
			max_tokens: 2000,
			messages: [{ role: "user", content: [{ type: "text", text: prompt }] }],
		});

		const textContent = message.content.find(
			(content) => content.type === "text",
		);
		const rawResponse = textContent?.text || "";

		const cleanedResponse = rawResponse
			.replace(/```jsx\s*/g, "")
			.replace(/```javascript\s*/g, "")
			.replace(/```\s*/g, "")
			.trim();

		return cleanedResponse;
	} catch (error) {
		console.error("Ошибка генерации React компонента:", error.message);
		throw error;
	}
}

// Функция генерации Storybook файла через Claude
async function generateStorybookWithClaude(componentName) {
	const prompt = `
Создай Storybook stories файл для React компонента ${componentName}:

Требования:
1. Импортируй компонент как DEFAULT EXPORT: import ${componentName} from '../components/${componentName}.jsx'
2. Создай несколько stories с разными состояниями
3. Включи controls для интерактивности
4. Используй CSF3 формат (Component Story Format 3)
5. Добавь метаданные для компонента
6. ОБЯЗАТЕЛЬНО используй default import, НЕ именованный import

Пример правильного импорта: 
import ${componentName} from '../components/${componentName}.jsx';

Формат ответа: только код Storybook stories без markdown форматирования.
`;

	try {
		const message = await anthropic.messages.create({
			model: "claude-sonnet-4-20250514",
			max_tokens: 2000,
			messages: [{ role: "user", content: [{ type: "text", text: prompt }] }],
		});

		const textContent = message.content.find(
			(content) => content.type === "text",
		);
		const rawResponse = textContent?.text || "";

		const cleanedResponse = rawResponse
			.replace(/```typescript\s*/g, "")
			.replace(/```javascript\s*/g, "")
			.replace(/```jsx\s*/g, "")
			.replace(/```\s*/g, "")
			.trim();

		return cleanedResponse;
	} catch (error) {
		console.error("Ошибка генерации Storybook:", error.message);
		throw error;
	}
}

// Функция генерации всех компонентов из simplified.json
async function generateComponentsFromSimplified(extractDir, fileId) {
	const simplifiedJsonPath = path.join(extractDir, "simplified.json");

	if (!(await fs.pathExists(simplifiedJsonPath))) {
		console.log("simplified.json не найден, пропускаем генерацию компонентов");
		return;
	}

	const simplifiedData = await fs.readJson(simplifiedJsonPath);

	// Создаем папки для компонентов и stories
	const componentsDir = path.join(__dirname, "src/components");
	const storiesDir = path.join(__dirname, "src/stories");

	await fs.ensureDir(componentsDir);
	await fs.ensureDir(storiesDir);

	console.log(`Генерируем ${simplifiedData.components.length} компонентов...`);

	for (const component of simplifiedData.components) {
		const componentName = component.name
			.replace(/\s+/g, "")
			.replace(/[^a-zA-Z0-9]/g, "");

		if (!componentName) continue;

		try {
			// Генерируем React компонент
			const reactCode = await generateReactComponentWithClaude(
				component,
				componentName,
			);
			const componentPath = path.join(componentsDir, `${componentName}.jsx`);
			await fs.writeFile(componentPath, reactCode);

			// Генерируем Storybook файл
			const storybookCode = await generateStorybookWithClaude(componentName);
			const storyPath = path.join(storiesDir, `${componentName}.stories.jsx`);
			await fs.writeFile(storyPath, storybookCode);

			console.log(`✅ Сгенерирован компонент: ${componentName}`);
		} catch (error) {
			console.error(
				`❌ Ошибка генерации компонента ${componentName}:`,
				error.message,
			);
		}
	}

	console.log(`🎉 Генерация завершена! Компоненты в: ${componentsDir}`);
	console.log(`📚 Stories в: ${storiesDir}`);
	console.log(`🚀 Запустите Storybook: npm run storybook`);
}

// Webhook обработчик
app.post("/", async (req, res) => {
	console.log("---------------------------");
	console.log("Получили webhook от Penpot!");
	console.log("Время:", new Date().toLocaleTimeString());
	console.log("Тип события:", req.body.name);

	const fileId = req.body.props?.id;

	if (req.body.name === "update-file" && fileId) {
		console.log(`Файл изменен: ${fileId}`);
		console.log("Запускаем экспорт файла...");

		const exportSuccess = await exportPenpotFile(fileId);

		if (exportSuccess) {
			console.log("Экспорт завершен успешно");
		} else {
			console.log("Экспорт завершился с ошибкой");
		}
	}

	res.sendStatus(200);
});

app.post("/generate-simplified/:fileId", async (req, res) => {
	try {
		console.log(
			`Ручная генерация simplified.json для файла: ${req.params.fileId}`,
		);
		const success = await generateSimplifiedFromLatest(req.params.fileId);
		res.json({
			success,
			message: success
				? "Simplified JSON обновлен успешно"
				: "Ошибка обновления simplified.json",
		});
	} catch (error) {
		console.error("Ошибка ручной генерации:", error);
		res.status(500).json({
			success: false,
			error: error.message,
		});
	}
});

// Главная страница
app.get("/", (req, res) => {
	res.send(`
		<h1>Penpot Webhook Handler</h1>
		<p>Сервер работает и готов принимать webhooks</p>
		<p>Файлы сохраняются в папку: ./history/</p>
		<p>Компоненты генерируются в: ./src/components/</p>
		
		<h3>Ссылки</h3>
		<a href="http://localhost:6006" target="_blank" style="color: #007bff;">Открыть Storybook (порт 6006)</a>
		<br><br>
		<p>Для запуска Storybook выполните: <code>npm run storybook</code></p>
	`);
});

// Запуск сервера
const PORT = 3000;
app.listen(PORT, () => {
	console.log(`Сервер запущен: http://localhost:${PORT}`);
	console.log("Webhook URL для Penpot: ваш_ngrok_url");
});
