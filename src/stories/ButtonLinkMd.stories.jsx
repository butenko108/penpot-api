import ButtonLinkMd from '../components/ButtonLinkMd.jsx';

export default {
  title: 'Components/ButtonLinkMd',
  component: ButtonLinkMd,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    children: {
      control: 'text',
      description: 'Button text content',
    },
    href: {
      control: 'text',
      description: 'Link URL',
    },
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'outline', 'ghost'],
      description: 'Button variant style',
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
      description: 'Button size',
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state',
    },
    target: {
      control: { type: 'select' },
      options: ['_self', '_blank', '_parent', '_top'],
      description: 'Link target attribute',
    },
  },
};

export const Default = {
  args: {
    children: 'Button Link',
    href: '#',
    variant: 'primary',
    size: 'md',
  },
};

export const Primary = {
  args: {
    children: 'Primary Button',
    href: '#',
    variant: 'primary',
    size: 'md',
  },
};

export const Secondary = {
  args: {
    children: 'Secondary Button',
    href: '#',
    variant: 'secondary',
    size: 'md',
  },
};

export const Outline = {
  args: {
    children: 'Outline Button',
    href: '#',
    variant: 'outline',
    size: 'md',
  },
};

export const Ghost = {
  args: {
    children: 'Ghost Button',
    href: '#',
    variant: 'ghost',
    size: 'md',
  },
};

export const Small = {
  args: {
    children: 'Small Button',
    href: '#',
    variant: 'primary',
    size: 'sm',
  },
};

export const Large = {
  args: {
    children: 'Large Button',
    href: '#',
    variant: 'primary',
    size: 'lg',
  },
};

export const Disabled = {
  args: {
    children: 'Disabled Button',
    href: '#',
    variant: 'primary',
    size: 'md',
    disabled: true,
  },
};

export const ExternalLink = {
  args: {
    children: 'External Link',
    href: 'https://example.com',
    variant: 'primary',
    size: 'md',
    target: '_blank',
  },
};

export const AllSizes = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
      <ButtonLinkMd href="#" variant="primary" size="sm">
        Small
      </ButtonLinkMd>
      <ButtonLinkMd href="#" variant="primary" size="md">
        Medium
      </ButtonLinkMd>
      <ButtonLinkMd href="#" variant="primary" size="lg">
        Large
      </ButtonLinkMd>
    </div>
  ),
};

export const AllVariants = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
      <ButtonLinkMd href="#" variant="primary">
        Primary
      </ButtonLinkMd>
      <ButtonLinkMd href="#" variant="secondary">
        Secondary
      </ButtonLinkMd>
      <ButtonLinkMd href="#" variant="outline">
        Outline
      </ButtonLinkMd>
      <ButtonLinkMd href="#" variant="ghost">
        Ghost
      </ButtonLinkMd>
    </div>
  ),
};