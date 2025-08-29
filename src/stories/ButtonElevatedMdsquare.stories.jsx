import ButtonElevatedMdsquare from '../components/ButtonElevatedMdsquare.jsx';

export default {
  title: 'Components/ButtonElevatedMdsquare',
  component: ButtonElevatedMdsquare,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Elevated medium square button component with customizable properties'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    children: {
      control: 'text',
      description: 'Button content'
    },
    disabled: {
      control: 'boolean',
      description: 'Disable button interaction'
    },
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'danger'],
      description: 'Button variant'
    },
    size: {
      control: { type: 'select' },
      options: ['small', 'medium', 'large'],
      description: 'Button size'
    },
    onClick: {
      action: 'clicked',
      description: 'Click handler function'
    }
  }
};

export const Default = {
  args: {
    children: 'Button',
    disabled: false,
    variant: 'primary',
    size: 'medium'
  }
};

export const Primary = {
  args: {
    children: 'Primary',
    variant: 'primary'
  }
};

export const Secondary = {
  args: {
    children: 'Secondary',
    variant: 'secondary'
  }
};

export const Danger = {
  args: {
    children: 'Danger',
    variant: 'danger'
  }
};

export const Disabled = {
  args: {
    children: 'Disabled',
    disabled: true
  }
};

export const Small = {
  args: {
    children: 'Small',
    size: 'small'
  }
};

export const Large = {
  args: {
    children: 'Large',
    size: 'large'
  }
};

export const WithIcon = {
  args: {
    children: '+ Add Item',
    variant: 'primary'
  }
};

export const AllVariants = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
      <ButtonElevatedMdsquare variant="primary">Primary</ButtonElevatedMdsquare>
      <ButtonElevatedMdsquare variant="secondary">Secondary</ButtonElevatedMdsquare>
      <ButtonElevatedMdsquare variant="danger">Danger</ButtonElevatedMdsquare>
      <ButtonElevatedMdsquare disabled>Disabled</ButtonElevatedMdsquare>
    </div>
  ),
  parameters: {
    controls: { disable: true }
  }
};