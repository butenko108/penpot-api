import type { Meta, StoryObj } from '@storybook/react';
import ButtonFilledMdsquare from '../components/ButtonFilledMdsquare.jsx';

const meta: Meta<typeof ButtonFilledMdsquare> = {
  title: 'Components/ButtonFilledMdsquare',
  component: ButtonFilledMdsquare,
  parameters: {
    layout: 'centered',
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
    onClick: {
      action: 'clicked',
      description: 'Click handler',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Button',
    disabled: false,
  },
};

export const Disabled: Story = {
  args: {
    children: 'Disabled Button',
    disabled: true,
  },
};

export const WithIcon: Story = {
  args: {
    children: '📱 Mobile',
    disabled: false,
  },
};

export const LongText: Story = {
  args: {
    children: 'Very Long Button Text',
    disabled: false,
  },
};

export const CustomClass: Story = {
  args: {
    children: 'Custom Styled',
    disabled: false,
    className: 'custom-button-class',
  },
};