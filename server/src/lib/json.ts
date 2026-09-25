/**
 * Extracts a JSON object from free-form model output.
 *
 * Models wrap JSON in prose, in ```json fences, or emit small syntax errors
 * that a strict parser rejects. This walks the first balanced `{...}` span
 * (respecting string literals so braces inside text don't confuse it) and
 * applies a couple of narrow repairs before parsing.
 */
export function parseJsonObject(raw: string): unknown {
  const span = extractBalancedObject(stripCodeFences(raw));
  if (!span) throw new Error("Aucun objet JSON trouvé dans la réponse du modèle");

  try {
    return JSON.parse(span);
  } catch {
    return JSON.parse(repair(span));
  }
}

function stripCodeFences(text: string): string {
  return text.replace(/```(?:json)?/gi, "");
}

/** Scans for the first `{` and returns through its matching `}`. */
function extractBalancedObject(text: string): string | null {
  const start = text.indexOf("{");
  if (start === -1) return null;

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = start; i < text.length; i++) {
    const char = text[i];

    if (escaped) {
      escaped = false;
      continue;
    }
    if (char === "\\") {
      escaped = true;
      continue;
    }
    if (char === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;

    if (char === "{") depth++;
    else if (char === "}") {
      depth--;
      if (depth === 0) return text.slice(start, i + 1);
    }
  }
  return null;
}

function repair(json: string): string {
  return (
    json
      // `"sets": 3-4` and `"rpe": 7-8` are the two the models emit most often.
      .replace(/:\s*(\d+(?:\.\d+)?\s*-\s*\d+(?:\.\d+)?)\s*(?=[,}\]])/g, ': "$1"')
      // Trailing commas before a closing brace or bracket.
      .replace(/,(\s*[}\]])/g, "$1")
  );
}
