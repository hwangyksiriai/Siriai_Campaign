// 가이드 본문을 자동으로 예쁘게: 여러 줄이면 불릿 목록, 한 줄이면 그대로.
// 대괄호로만 된 줄([순율크림] 등)은 소제목으로 처리.
export default function NoteBody({ text }) {
  const lines = String(text || "")
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);

  if (lines.length <= 1) {
    return <div className="body">{text}</div>;
  }

  return (
    <ul className="body note-list">
      {lines.map((line, i) =>
        /^\[[^\]]+\]$/.test(line) ? (
          <li className="note-head" key={i}>
            {line.replace(/^\[|\]$/g, "")}
          </li>
        ) : (
          <li key={i}>{line}</li>
        )
      )}
    </ul>
  );
}
