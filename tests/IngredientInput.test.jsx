import React, { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import IngredientInput from '../components/IngredientInput';

function Wrapper() {
  const [ingredients, setIngredients] = useState([]);
  return (
    <div>
      <IngredientInput ingredients={ingredients} setIngredients={setIngredients} />
      <div data-testid="count">{ingredients.length}</div>
    </div>
  );
}

describe('IngredientInput', () => {
  it('adds an ingredient when clicking Add', async () => {
    render(<Wrapper />);
    const input = screen.getByPlaceholderText(/Add an ingredient/i);
    await userEvent.type(input, 'chicken');
    const btn = screen.getByRole('button', { name: /add/i });
    await userEvent.click(btn);
    // count should increment
    expect(screen.getByTestId('count')).toHaveTextContent('1');
    // chip should be visible
    expect(screen.getByText('chicken')).toBeInTheDocument();
  });
});

