import { memo, useEffect, useMemo, useState } from 'react';
import { parseIdentifierList, toCsv, type IdentifierResult, type ValidationStatus } from './lib/cin';

const MAX_ENTRIES = 5_000;
const INITIAL_RESULT_BATCH = 500;
const EXAMPLE_INPUT = [
  'L17110MH1973PLC019786',
  'U40108CT2003SGC015822',
  'AAA-0150',
  'L17O10MH1973PLC019786',
  'L17110XX1973ZZZ019786',
].join('\n');

type FilterMode = 'all' | 'invalid' | 'review';

function statusLabel(status: ValidationStatus): string {
  if (status === 'valid') return 'Valid';
  if (status === 'valid-with-warnings') return 'Needs review';
  return 'Invalid';
}

function statusIcon(status: ValidationStatus): string {
  if (status === 'valid') return '✓';
  if (status === 'valid-with-warnings') return '!';
  return '×';
}

function getCompanyTypeDisplay(result: IdentifierResult): string {
  if (result.kind === 'llp') return 'Not encoded in LLPIN';
  return result.companyTypeMeaning ?? (result.companyType ? `Unmapped (${result.companyType})` : 'Not mapped');
}

function getStateDisplay(result: IdentifierResult): string {
  if (result.kind === 'llp') return 'Not encoded in LLPIN';
  return result.stateName ?? (result.stateCode ? `Unmapped (${result.stateCode})` : 'Not mapped');
}

function copySummary(results: IdentifierResult[]): string {
  return results.map((result) => {
    const lines = [
      `Entry ${result.entryNumber}: ${result.normalizedInput}`,
      `Result: ${statusLabel(result.status)}`,
      `Type: ${result.kind === 'company' ? 'Company' : result.kind === 'llp' ? 'LLP' : 'Unknown'}`,
    ];
    if (result.kind === 'company') {
      lines.push(
        `Listing: ${result.listed === undefined ? 'Not decoded' : result.listed ? 'Listed' : 'Unlisted'}`,
        `State: ${getStateDisplay(result)}`,
        `Incorporation year: ${result.incorporationYear ?? 'Not decoded'}`,
        `Company type: ${getCompanyTypeDisplay(result)}`,
      );
    } else if (result.kind === 'llp') {
      lines.push(
        'Listing status: Not encoded in LLPIN',
        'State: Not encoded in LLPIN',
        'Incorporation year: Not encoded in LLPIN',
        'Company type: Not encoded in LLPIN',
      );
    }
    if (result.errors.length) lines.push(`Errors: ${result.errors.join('; ')}`);
    if (result.warnings.length) lines.push(`Warnings: ${result.warnings.join('; ')}`);
    if (result.information.length) lines.push(`Information: ${result.information.join('; ')}`);
    if (result.duplicateOfEntry !== undefined) lines.push(`Duplicate of entry ${result.duplicateOfEntry}`);
    return lines.join('\n');
  }).join('\n\n');
}

const ResultCard = memo(function ResultCard({ result }: { result: IdentifierResult }) {
  const isCompany = result.kind === 'company';
  const isLlp = result.kind === 'llp';
  return (
    <article className={`result-card result-card--${result.status}`} aria-labelledby={`result-title-${result.entryNumber}`}>
      <div className="result-card__topline">
        <span className="entry-label">ENTRY {result.entryNumber}</span>
        <span className={`status-pill status-pill--${result.status}`}>
          <span className="status-pill__icon" aria-hidden="true">{statusIcon(result.status)}</span>
          {statusLabel(result.status)}
        </span>
      </div>

      <div className="result-card__heading">
        <div>
          <h3 id={`result-title-${result.entryNumber}`}>{result.title}</h3>
          <p>{result.subtitle}</p>
        </div>
        {result.duplicateOfEntry !== undefined && (
          <span className="duplicate-pill">Duplicate · entry {result.duplicateOfEntry}</span>
        )}
      </div>

      <div className={`segment-list ${result.invalidSegment === 'input' ? 'segment-list--invalid' : ''}`} role="group" aria-label="Identifier segments">
        {result.segments.map((segment, index) => (
          <div className="segment-wrap" key={`${segment.key}-${index}`}>
            <div className={`segment-chip ${segment.state ? `segment-chip--${segment.state}` : ''}`} role="group" aria-label={`${segment.label}: ${segment.value}${segment.meaning ? `, ${segment.meaning}` : ''}`} title={segment.meaning}>
              <span className="segment-chip__label">{segment.label}</span>
              <span className="segment-chip__value">{segment.value}</span>
            </div>
            {index < result.segments.length - 1 && <span className="segment-separator" aria-hidden="true">·</span>}
          </div>
        ))}
      </div>

      {isCompany && (
        <dl className="metadata-grid">
          <div>
            <dt>Listing status</dt>
            <dd>{result.listed === undefined ? 'Not decoded' : result.listed ? 'Listed' : 'Unlisted'}</dd>
          </div>
          <div>
            <dt>State</dt>
            <dd>{getStateDisplay(result)}</dd>
          </div>
          <div>
            <dt>Incorporation year</dt>
            <dd>{result.incorporationYear ?? 'Not decoded'}</dd>
          </div>
          <div>
            <dt>Company type</dt>
            <dd>{getCompanyTypeDisplay(result)}</dd>
          </div>
        </dl>
      )}

      {isLlp && (
        <dl className="metadata-grid metadata-grid--llp">
          <div><dt>Listing status</dt><dd>Not encoded in LLPIN</dd></div>
          <div><dt>State</dt><dd>Not encoded in LLPIN</dd></div>
          <div><dt>Incorporation year</dt><dd>Not encoded in LLPIN</dd></div>
          <div><dt>Company type</dt><dd>Not encoded in LLPIN</dd></div>
        </dl>
      )}

      {result.isNormalized && (
        <p className="normalised-note" title={result.normalizationNotes.join('; ')}><span aria-hidden="true">↳</span> Normalised from <code>{JSON.stringify(result.rawInput)}</code></p>
      )}

      {result.errors.length > 0 && (
        <div className="message-list message-list--error" role="note">
          <p className="message-list__title"><span aria-hidden="true">×</span> What needs fixing</p>
          {result.errors.map((error) => <p className="message-list__item" key={error}>{error}</p>)}
        </div>
      )}

      {result.warnings.length > 0 && (
        <div className="message-list message-list--warning" role="note">
          <p className="message-list__title"><span aria-hidden="true">!</span> Notes to review</p>
          {result.warnings.map((warning) => <p className="message-list__item" key={warning}>{warning}</p>)}
        </div>
      )}
      {result.information.length > 0 && (
        <div className="message-list message-list--info" role="note">
          <p className="message-list__title"><span aria-hidden="true">i</span> {isLlp ? 'About LLPIN fields' : 'Additional information'}</p>
          {result.information.map((item) => <p className="message-list__item" key={item}>{item}</p>)}
        </div>
      )}
    </article>
  );
});

function App() {
  const [input, setInput] = useState('');
  const [debouncedInput, setDebouncedInput] = useState('');
  const [filter, setFilter] = useState<FilterMode>('all');
  const [copyMessage, setCopyMessage] = useState('');
  const [renderLimit, setRenderLimit] = useState(INITIAL_RESULT_BATCH);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedInput(input), 180);
    return () => window.clearTimeout(timer);
  }, [input]);

  useEffect(() => {
    if (!copyMessage) return;
    const timer = window.setTimeout(() => setCopyMessage(''), 2_500);
    return () => window.clearTimeout(timer);
  }, [copyMessage]);

  const parsed = useMemo(
    () => parseIdentifierList(debouncedInput, { maxEntries: MAX_ENTRIES }),
    [debouncedInput],
  );

  const validCount = parsed.results.filter((result) => result.status === 'valid').length;
  const reviewCount = parsed.results.filter((result) => result.status === 'valid-with-warnings').length;
  const invalidCount = parsed.results.filter((result) => result.status === 'invalid').length;
  const duplicateCount = parsed.results.filter((result) => result.duplicateOfEntry !== undefined).length;

  const visibleResults = parsed.results.filter((result) => {
    if (filter === 'invalid') return result.status === 'invalid';
    if (filter === 'review') return result.status === 'valid-with-warnings';
    return true;
  });
  const displayedResults = visibleResults.slice(0, renderLimit);

  const loadExample = () => {
    setInput(EXAMPLE_INPUT);
    setFilter('all');
    setRenderLimit(INITIAL_RESULT_BATCH);
    setCopyMessage('');
  };

  const clearInput = () => {
    setInput('');
    setDebouncedInput('');
    setFilter('all');
    setRenderLimit(INITIAL_RESULT_BATCH);
    setCopyMessage('');
  };

  const handleCopy = async () => {
    if (visibleResults.length === 0) return;
    try {
      await navigator.clipboard.writeText(copySummary(visibleResults));
      setCopyMessage('Copied');
    } catch {
      setCopyMessage('Clipboard unavailable in this browser');
    }
  };

  const handleDownload = () => {
    if (visibleResults.length === 0) return;
    const blob = new Blob([`\uFEFF${toCsv(visibleResults)}`], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'filesure-cin-check-results.csv';
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
  };

  const isUpdating = input !== debouncedInput;

  return (
    <main className="page-shell">
      <header className="topbar">
        <a className="brand" href="https://www.filesure.in/" aria-label="FileSure home">
          <span className="brand-mark" aria-hidden="true">F</span>
          <span>FileSure</span>
        </a>
        <span className="product-label">FREE TOOL <span aria-hidden="true">·</span> CIN &amp; LLPIN</span>
      </header>

      <section className="intro" aria-labelledby="page-title">
        <p className="eyebrow">IDENTIFIER CHECKER</p>
        <h1 id="page-title">Make sense of a company number.</h1>
        <p className="intro-copy">
          Understand the structure behind Indian company CINs and LLPINs.
          Check a list at once, with clear explanations for every entry.
        </p>
        <div className="trust-note">
          <span className="trust-note__icon" aria-hidden="true">i</span>
          A format check, not an MCA existence or status verification.
        </div>
      </section>

      <section className="workspace" aria-label="CIN and LLPIN checker">
        <section className="input-panel" aria-labelledby="input-title">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">YOUR LIST</p>
              <h2 id="input-title">Paste identifiers</h2>
            </div>
            <span className="count-pill">{parsed.totalEntries.toLocaleString('en-IN')} {parsed.totalEntries === 1 ? 'entry' : 'entries'}</span>
          </div>

          <label className="sr-only" htmlFor="identifier-input">Paste one CIN or LLPIN per line</label>
          <textarea
            id="identifier-input"
            className="identifier-input"
            value={input}
            onChange={(event) => {
              setInput(event.target.value);
              setRenderLimit(INITIAL_RESULT_BATCH);
              setCopyMessage('');
            }}
            placeholder={'L17110MH1973PLC019786\nAAA-0150\n\nOne identifier per line…'}
            spellCheck={false}
            autoCapitalize="characters"
            autoCorrect="off"
            aria-describedby="input-help privacy-note"
          />
          <div className="input-actions">
            <button className="button button--text" type="button" onClick={loadExample}>Try an example <span aria-hidden="true">↗</span></button>
            <button className="button button--quiet" type="button" onClick={clearInput} disabled={!input}>Clear</button>
          </div>
          <p className="input-help" id="input-help">One identifier per line · Up to {MAX_ENTRIES.toLocaleString('en-IN')} entries</p>
          <p className="privacy-note" id="privacy-note"><span aria-hidden="true">◈</span> Your list is checked in this browser. It is not uploaded.</p>
        </section>

        <section className="results-panel" aria-labelledby="results-title" aria-busy={isUpdating}>
          <div className="panel-heading results-heading">
            <div>
              <p className="eyebrow">YOUR RESULTS</p>
              <h2 id="results-title">{parsed.totalEntries > 0 ? 'Identifier breakdown' : 'Results appear here'}</h2>
            </div>
            <span className="result-icon" aria-hidden="true">↳</span>
          </div>

          {parsed.totalEntries === 0 ? (
            <div className="empty-preview">
              <div className="empty-illustration" aria-hidden="true">
                <span className="doc-sheet"><i /><i /><i /></span>
                <span className="check-mark">✓</span>
              </div>
              <h3>Nothing to check yet</h3>
              <p>Paste a CIN or LLPIN to see its parts, what they mean, and anything that needs attention.</p>
              <button className="empty-example" type="button" onClick={loadExample}>Try a sample list <span aria-hidden="true">→</span></button>
            </div>
          ) : (
            <>
              <div className="summary-bar" aria-live="polite" aria-atomic="true">
                <div className="summary-total">
                  <strong>{parsed.processedEntries.toLocaleString('en-IN')}</strong>
                  <span>{parsed.limitExceeded ? 'processed' : 'checked'}</span>
                </div>
                <div className="summary-stat summary-stat--valid"><span className="summary-stat__dot" />{validCount} valid</div>
                <div className="summary-stat summary-stat--review"><span className="summary-stat__dot" />{reviewCount} review</div>
                <div className="summary-stat summary-stat--invalid"><span className="summary-stat__dot" />{invalidCount} invalid</div>
                <div className="summary-stat summary-stat--duplicate"><span className="summary-stat__dot" />{duplicateCount} {duplicateCount === 1 ? 'duplicate' : 'duplicates'}</div>
              </div>

              {parsed.ignoredBlankEntries > 0 && (
                <p className="list-note">{parsed.ignoredBlankEntries} blank {parsed.ignoredBlankEntries === 1 ? 'line or cell was' : 'lines or cells were'} ignored.</p>
              )}
              {parsed.ignoredNonIdentifierCells > 0 && (
                <p className="list-note">Ignored {parsed.ignoredNonIdentifierCells} non-identifier spreadsheet {parsed.ignoredNonIdentifierCells === 1 ? 'cell' : 'cells'} (such as company-name columns).</p>
              )}
              {parsed.limitExceeded && (
                <div className="limit-notice" role="alert">
                  <strong>Input limit reached.</strong> {parsed.truncatedEntries.toLocaleString('en-IN')} additional non-empty entries were not processed. The limit is {MAX_ENTRIES.toLocaleString('en-IN')} entries.
                </div>
              )}

              <div className="results-toolbar">
                <div className="filter-group" role="group" aria-label="Filter results">
                  <button aria-pressed={filter === 'all'} className={`filter-button ${filter === 'all' ? 'is-active' : ''}`} type="button" onClick={() => { setFilter('all'); setRenderLimit(INITIAL_RESULT_BATCH); setCopyMessage(''); }}>All <span>{parsed.results.length}</span></button>
                  <button aria-pressed={filter === 'invalid'} className={`filter-button ${filter === 'invalid' ? 'is-active' : ''}`} type="button" onClick={() => { setFilter('invalid'); setRenderLimit(INITIAL_RESULT_BATCH); setCopyMessage(''); }}>Invalid <span>{invalidCount}</span></button>
                  <button aria-pressed={filter === 'review'} className={`filter-button ${filter === 'review' ? 'is-active' : ''}`} type="button" onClick={() => { setFilter('review'); setRenderLimit(INITIAL_RESULT_BATCH); setCopyMessage(''); }}>Review <span>{reviewCount}</span></button>
                </div>
                <div className="export-actions">
                  <button className="export-button" type="button" onClick={handleCopy} disabled={visibleResults.length === 0 || isUpdating}>
                    <span aria-hidden="true">▣</span> {copyMessage || 'Copy'}
                  </button>
                  <span className="sr-only" role="status" aria-live="polite" aria-atomic="true">{copyMessage}</span>
                  <button className="export-button" type="button" onClick={handleDownload} disabled={visibleResults.length === 0 || isUpdating}>
                    <span aria-hidden="true">↓</span> CSV
                  </button>
                </div>
              </div>

              {isUpdating && <p className="updating-note" role="status">Updating results…</p>}
              {visibleResults.length > 0 ? (
                <div className="result-list">
                  {displayedResults.map((result) => <ResultCard result={result} key={`${result.entryNumber}-${result.normalizedInput}`} />)}
                </div>
              ) : (
                <div className="filtered-empty">
                  <strong>No {filter === 'invalid' ? 'invalid' : 'review'} entries.</strong>
                  <span>Try another filter to see the rest of your list.</span>
                </div>
              )}
              {visibleResults.length > renderLimit && (
                <div className="load-more-wrap">
                  <p>Showing {displayedResults.length.toLocaleString('en-IN')} of {visibleResults.length.toLocaleString('en-IN')} results.</p>
                  <button type="button" className="load-more-button" onClick={() => setRenderLimit((limit) => Math.min(limit + INITIAL_RESULT_BATCH, visibleResults.length))}>
                    Show next {Math.min(INITIAL_RESULT_BATCH, visibleResults.length - renderLimit).toLocaleString('en-IN')} results
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </section>

      <section className="disclaimer" aria-label="Important information">
        <span className="disclaimer__mark" aria-hidden="true">i</span>
        <p><strong>What this check means.</strong> A valid result means the identifier follows the expected format and the decoded segments are recognised where possible. It does not confirm that a company or LLP exists, is active, or is registered against that number. For official records, check the <a href="https://www.mcacdm.nic.in/company-master-details" target="_blank" rel="noreferrer">MCA master-data service</a>.</p>
      </section>

      <footer className="page-footer">
        <span>Made for clearer company records.</span>
        <a href="https://www.filesure.in/">Explore FileSure <span aria-hidden="true">↗</span></a>
      </footer>
    </main>
  );
}

export default App;
