// Web Speech API wrapper with intelligent mathematical phrase normalizer

export function normalizeMathSpeech(transcript: string): string {
  let text = transcript.toLowerCase();

  const replacements: [RegExp, string][] = [
    [/\bplus\b/g, '+'],
    [/\bminus\b/g, '-'],
    [/\btimes\b|\bmultiplied by\b/g, '*'],
    [/\bdivided by\b|\bover\b/g, '/'],
    [/\bequals\b|\bequal to\b/g, '='],
    [/\bsquared\b/g, '^2'],
    [/\bcubed\b/g, '^3'],
    [/\bto the power of\b|\bto the power\b|\braised to\b/g, '^'],
    [/\bsquare root of\b/g, 'sqrt('],
    [/\bcube root of\b/g, 'cbrt('],
    [/\bopen parenthesis\b|\bopen bracket\b/g, '('],
    [/\bclose parenthesis\b|\bclose bracket\b/g, ')'],
    [/\bpi\b/g, 'π'],
    [/\bdegree\b|\bdegrees\b/g, 'deg'],
    [/\bpercent\b|\bpercentage\b/g, '%'],
    // Word numbers to digits
    [/\bzero\b/g, '0'],
    [/\bone\b/g, '1'],
    [/\btwo\b/g, '2'],
    [/\bthree\b/g, '3'],
    [/\bfour\b/g, '4'],
    [/\bfive\b/g, '5'],
    [/\bsix\b/g, '6'],
    [/\bseven\b/g, '7'],
    [/\beight\b/g, '8'],
    [/\bnine\b/g, '9'],
    [/\bten\b/g, '10'],
  ];

  for (const [regex, replacement] of replacements) {
    text = text.replace(regex, replacement);
  }

  // Handle spacing around operators: e.g. "2 x" -> "2x", "5 + 3" -> "5 + 3"
  text = text.replace(/(\d+)\s+x\b/g, '$1x');
  text = text.replace(/x\s+\^/g, 'x^');
  
  // Close sqrt if opened without closing
  const openParens = (text.match(/\(/g) || []).length;
  const closeParens = (text.match(/\)/g) || []).length;
  if (openParens > closeParens) {
    text += ')'.repeat(openParens - closeParens);
  }

  return text.trim();
}

interface SpeechRecognitionResultItem {
  transcript: string;
}

interface SpeechRecognitionResultList {
  [index: number]: { [index: number]: SpeechRecognitionResultItem };
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent {
  error: string;
}

interface ISpeechRecognition {
  new (): {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    onresult: ((event: SpeechRecognitionEvent) => void) | null;
    onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
    onend: (() => void) | null;
    start: () => void;
    stop: () => void;
  };
}

export function startSpeechRecognition(
  onResult: (transcript: string, normalized: string) => void,
  onError: (error: string) => void,
  onEnd: () => void
): { stop: () => void } | null {
  if (typeof window === 'undefined') return null;

  const win = window as unknown as {
    SpeechRecognition?: ISpeechRecognition;
    webkitSpeechRecognition?: ISpeechRecognition;
  };

  const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    onError('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
    return null;
  }

  try {
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const raw = event.results[0][0].transcript;
      const normalized = normalizeMathSpeech(raw);
      onResult(raw, normalized);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      onError(`Speech recognition error: ${event.error}`);
    };

    recognition.onend = () => {
      onEnd();
    };

    recognition.start();

    return {
      stop: () => {
        try {
          recognition.stop();
        } catch {}
      },
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Could not start speech recognition.';
    onError(msg);
    return null;
  }
}
