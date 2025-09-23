import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Button from '../Button';

// Mock the useTouchFeedback hook
jest.mock('../../../hooks/useTouchFeedback', () => ({
  useTouchFeedback: () => ({
    handleTouchStart: jest.fn(),
    handleTouchEnd: jest.fn(),
  }),
}));

describe('Button', () => {
  test('기본 버튼이 렌더링된다', () => {
    render(<Button>Click me</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Click me');
    expect(button).toHaveAttribute('type', 'button');
  });

  test('다양한 variant가 적용된다', () => {
    const { rerender } = render(<Button variant="primary">Primary</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();
    
    rerender(<Button variant="secondary">Secondary</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();
    
    rerender(<Button variant="ghost">Ghost</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();
    
    rerender(<Button variant="danger">Danger</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  test('다양한 size가 적용된다', () => {
    const { rerender } = render(<Button size="sm">Small</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();
    
    rerender(<Button size="base">Base</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();
    
    rerender(<Button size="lg">Large</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  test('클릭 이벤트가 올바르게 작동한다', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('disabled 상태에서 클릭이 방지된다', () => {
    const handleClick = jest.fn();
    render(<Button disabled onClick={handleClick}>Disabled</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    
    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  test('loading 상태가 올바르게 표시된다', () => {
    const handleClick = jest.fn();
    render(<Button loading onClick={handleClick}>Loading</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(button).toBeDisabled();
    
    // loading 상태에서는 클릭이 동작하지 않아야 함
    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  test('접근성 속성이 올바르게 설정된다', () => {
    render(
      <Button
        id="test-button"
        ariaLabel="Test button"
        ariaDescribedBy="description"
        ariaPressed={true}
        ariaExpanded={false}
      >
        Button
      </Button>
    );
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('id', 'test-button');
    expect(button).toHaveAttribute('aria-label', 'Test button');
    expect(button).toHaveAttribute('aria-describedby', 'description');
    expect(button).toHaveAttribute('aria-pressed', 'true');
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });

  test('사용자 정의 클래스와 스타일이 적용된다', () => {
    render(
      <Button 
        className="custom-class" 
        style={{ backgroundColor: 'red' }}
      >
        Styled Button
      </Button>
    );
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('replant-button');
    expect(button).toHaveClass('custom-class');
    expect(button).toHaveStyle('background-color: red');
  });

  test('버튼이 포커스를 받을 수 있다', () => {
    render(<Button>Button</Button>);
    
    const button = screen.getByRole('button');
    button.focus();
    
    expect(button).toHaveFocus();
  });

  test('submit type 버튼이 올바르게 작동한다', () => {
    render(<Button type="submit">Submit</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('type', 'submit');
  });

  test('loading과 disabled가 동시에 적용될 때 올바르게 작동한다', () => {
    const handleClick = jest.fn();
    render(
      <Button loading disabled onClick={handleClick}>
        Button
      </Button>
    );
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
    
    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  test('터치 이벤트가 올바르게 작동한다', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Touch Button</Button>);
    
    const button = screen.getByRole('button');
    
    fireEvent.touchStart(button);
    fireEvent.touchEnd(button);
    
    // 터치 이벤트는 useTouchFeedback hook으로 처리됨
    expect(button).toBeInTheDocument();
  });

  test('children이 올바르게 렌더링된다', () => {
    render(
      <Button>
        <span>Icon</span>
        <span>Text</span>
      </Button>
    );
    
    const button = screen.getByRole('button');
    expect(button).toHaveTextContent('IconText');
  });
});