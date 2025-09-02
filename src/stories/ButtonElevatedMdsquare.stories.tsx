import type { Meta, StoryObj } from '@storybook/react';
import ButtonElevatedMdsquare from '../components/ButtonElevatedMdsquare';

const meta: Meta<typeof ButtonElevatedMdsquare> = {
  title: 'Components/ButtonElevatedMdsquare',
  component: ButtonElevatedMdsquare,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Medium square elevated button component with customizable properties',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    children: {
      control: 'text',
      description: 'Button content',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable the button',
    },
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'tertiary'],
      description: 'Button variant',
    },
    size: {
      control: { type: 'select' },
      options: ['small', 'medium', 'large'],
      description: 'Button size',
    },
    onClick: {
      action: 'clicked',
      description: 'Click handler',
    },
    loading: {
      control: 'boolean',
      description: 'Loading state',
    },
    icon: {
      control: 'text',
      description: 'Icon name or element',
    },
    fullWidth: {
      control: 'boolean',
      description: 'Full width button',
    },
  },
  args: {
    children: 'Button',
    disabled: false,
    variant: 'primary',
    size: 'medium',
    loading: false,
    fullWidth: false,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Default Button',
  },
};

export const Primary: Story = {
  args: {
    children: 'Primary Button',
    variant: 'primary',
  },
};

export const Secondary: Story = {
  args: {
    children: 'Secondary Button',
    variant: 'secondary',
  },
};

export const Tertiary: Story = {
  args: {
    children: 'Tertiary Button',
    variant: 'tertiary',
  },
};

export const Disabled: Story = {
  args: {
    children: 'Disabled Button',
    disabled: true,
  },
};

export const Loading: Story = {
  args: {
    children: 'Loading Button',
    loading: true,
  },
};

export const Small: Story = {
  args: {
    children: 'Small Button',
    size: 'small',
  },
};

export const Large: Story = {
  args: {
    children: 'Large Button',
    size: 'large',
  },
};

export const WithIcon: Story = {
  args: {
    children: 'Button with Icon',
    icon: '⭐',
  },
};

export const FullWidth: Story = {
  args: {
    children: 'Full Width Button',
    fullWidth: true,
  },
  parameters: {
    layout: 'padded',
  },
};

export const Interactive: Story = {
  args: {
    children: 'Click Me!',
    onClick: () => alert('Button clicked!'),
  },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
      <ButtonElevatedMdsquare variant="primary">Primary</ButtonElevatedMdsquare>
      <ButtonElevatedMdsquare variant="secondary">Secondary</ButtonElevatedMdsquare>
      <ButtonElevatedMdsquare variant="tertiary">Tertiary</ButtonElevatedMdsquare>
      <ButtonElevatedMdsquare disabled>Disabled</ButtonElevatedMdsquare>
    </div>
  ),
  parameters: {
    controls: { disable: true },
  },
};