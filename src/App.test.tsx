import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from './App';

describe('FileSure checker interface', () => {
  it('shows a designed empty state before input is provided', () => {
    render(<App />);
    expect(screen.getByText('Nothing to check yet')).toBeInTheDocument();
    expect(screen.getByLabelText('Paste one CIN or LLPIN per line')).toBeInTheDocument();
  });

  it('loads a sample list and renders per-entry results', async () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /try a sample list/i }));
    expect(await screen.findByText('Identifier breakdown')).toBeInTheDocument();
    // The sample contains two structurally valid CINs, so assert both cards.
    const validCinHeadings = await screen.findAllByRole('heading', { name: 'Valid CIN format' });
    expect(validCinHeadings).toHaveLength(2);
    expect(screen.getByText('Invalid CIN format')).toBeInTheDocument();
    expect(screen.getByText(/what this check means/i)).toBeInTheDocument();
  });

  it('marks the results panel busy while the live input is debouncing', () => {
    render(<App />);
    const input = screen.getByLabelText('Paste one CIN or LLPIN per line');
    fireEvent.change(input, { target: { value: 'L17110MH1973PLC019786' } });
    expect(document.querySelector('.results-panel')).toHaveAttribute('aria-busy', 'true');
  });

  it('clears the list and returns to the empty state', async () => {
    render(<App />);
    const input = screen.getByLabelText('Paste one CIN or LLPIN per line');
    fireEvent.change(input, { target: { value: 'L17110MH1973PLC019786' } });
    await screen.findByText('Identifier breakdown');
    fireEvent.click(screen.getByRole('button', { name: 'Clear' }));
    expect(screen.getByText('Nothing to check yet')).toBeInTheDocument();
  });



  it('shows NPL historical context as information, not as a review warning', async () => {
    render(<App />);
    const input = screen.getByLabelText('Paste one CIN or LLPIN per line');
    fireEvent.change(input, { target: { value: 'L17110MH1973NPL019786' } });
    expect(await screen.findByText('Valid CIN format')).toBeInTheDocument();
    expect(screen.getByText('Additional information')).toBeInTheDocument();
    expect(screen.getByText(/does not establish an individual company/i)).toBeInTheDocument();
    expect(screen.queryByText('Needs review')).not.toBeInTheDocument();
  });

  it('renders the UR state code as Uttarakhand in the result card', async () => {
    render(<App />);
    const input = screen.getByLabelText('Paste one CIN or LLPIN per line');
    fireEvent.change(input, { target: { value: 'U40109UR2001SGC025867' } });
    expect(await screen.findByText('Valid CIN format')).toBeInTheDocument();
    expect(screen.getByText('Uttarakhand')).toBeInTheDocument();
  });

  it('shows all LLPIN-only metadata as not encoded', async () => {
    render(<App />);
    const input = screen.getByLabelText('Paste one CIN or LLPIN per line');
    fireEvent.change(input, { target: { value: 'AAA-1234' } });
    expect(await screen.findByText('Valid LLPIN format')).toBeInTheDocument();
    expect(screen.getAllByText('Not encoded in LLPIN')).toHaveLength(4);
  });

  it('disables CSV export when the active filter has no results', async () => {
    render(<App />);
    const input = screen.getByLabelText('Paste one CIN or LLPIN per line');
    fireEvent.change(input, { target: { value: 'L17110MH1973PLC019786' } });
    expect(await screen.findByText('Valid CIN format')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /^Invalid\s+0$/i }));
    expect(screen.getByRole('button', { name: /CSV/i })).toBeDisabled();
  });

  it('shows only invalid entries when the invalid filter is selected', async () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /try a sample list/i }));
    await screen.findByText('Identifier breakdown');
    fireEvent.click(screen.getByRole('button', { name: /^Invalid\s+1$/i }));
    expect(screen.getByText('Invalid CIN format')).toBeInTheDocument();
    expect(screen.queryByText('Valid CIN format')).not.toBeInTheDocument();
  });
  it('shows a separate duplicate count while duplicates remain in review', async () => {
    render(<App />);
    const input = screen.getByLabelText('Paste one CIN or LLPIN per line');
    fireEvent.change(input, { target: { value: 'L17110MH1973PLC019786\nL17110MH1973PLC019786' } });
    expect(await screen.findByText('Duplicate CIN entry')).toBeInTheDocument();
    expect(screen.getByText('1 duplicate')).toBeInTheDocument();
    expect(screen.getByText('1 review')).toBeInTheDocument();
  });

  it('explains ignored company-name cells when an Excel row includes a CIN column', async () => {
    const { container } = render(<App />);
    const input = screen.getByLabelText('Paste one CIN or LLPIN per line');
    fireEvent.change(input, { target: { value: 'Company Name\tCIN\nReliance Industries Limited\tL17110MH1973PLC019786' } });
    expect(await screen.findByText('Valid CIN format')).toBeInTheDocument();
    expect(screen.getByText(/Ignored 3 non-identifier spreadsheet cells/i)).toBeInTheDocument();
    expect(container.querySelector('.summary-total strong')).toHaveTextContent('1');
  });

});
