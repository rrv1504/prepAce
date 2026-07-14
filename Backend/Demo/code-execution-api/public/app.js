const languageSelect = document.getElementById("languageSelect");
const sampleSelect = document.getElementById("sampleSelect");
const codeEditor = document.getElementById("codeEditor");
const inputEditor = document.getElementById("inputEditor");
const runButton = document.getElementById("runButton");
const statusBadge = document.getElementById("statusBadge");
const timeMetric = document.getElementById("timeMetric");
const exitMetric = document.getElementById("exitMetric");
const outputBox = document.getElementById("outputBox");

const samples = {
  cpp: {
    hello: {
      code: '#include <iostream>\nusing namespace std;\n\nint main() {\n  cout << "Hello CPP" << endl;\n  return 0;\n}\n',
      input: "",
    },
    input: {
      code: "#include <iostream>\nusing namespace std;\n\nint main() {\n  int a, b;\n  cin >> a >> b;\n  cout << a + b << endl;\n  return 0;\n}\n",
      input: "10 20",
    },
    "compile-error": {
      code: '#include <iostream>\nusing namespace std;\n\nint main() {\n  cout << "Missing semicolon" << endl\n  return 0;\n}\n',
      input: "",
    },
    "runtime-error": {
      code: "#include <iostream>\nusing namespace std;\n\nint main() {\n  int a = 1;\n  int b = 0;\n  cout << a / b << endl;\n  return 0;\n}\n",
      input: "",
    },
    timeout: {
      code: "#include <iostream>\nusing namespace std;\n\nint main() {\n  while (true) {}\n  return 0;\n}\n",
      input: "",
    },
  },
  c: {
    hello: {
      code: '#include <stdio.h>\n\nint main() {\n  printf("Hello C\\n");\n  return 0;\n}\n',
      input: "",
    },
    input: {
      code: '#include <stdio.h>\n\nint main() {\n  int a, b;\n  scanf("%d %d", &a, &b);\n  printf("%d\\n", a * b);\n  return 0;\n}\n',
      input: "6 7",
    },
    "compile-error": {
      code: '#include <stdio.h>\n\nint main() {\n  printf("Missing semicolon\\n")\n  return 0;\n}\n',
      input: "",
    },
    "runtime-error": {
      code: '#include <stdio.h>\n\nint main() {\n  int a = 1;\n  int b = 0;\n  printf("%d\\n", a / b);\n  return 0;\n}\n',
      input: "",
    },
    timeout: {
      code: "#include <stdio.h>\n\nint main() {\n  while (1) {}\n  return 0;\n}\n",
      input: "",
    },
  },
  java: {
    hello: {
      code: 'public class Main {\n  public static void main(String[] args) {\n    System.out.println("Hello Java");\n  }\n}\n',
      input: "",
    },
    input: {
      code: 'import java.util.*;\n\npublic class Main {\n  public static void main(String[] args) {\n    Scanner sc = new Scanner(System.in);\n    int a = sc.nextInt();\n    int b = sc.nextInt();\n    System.out.println(a - b);\n  }\n}\n',
      input: "50 15",
    },
    "compile-error": {
      code: 'public class Main {\n  public static void main(String[] args) {\n    System.out.println("Missing semicolon")\n  }\n}\n',
      input: "",
    },
    "runtime-error": {
      code: 'public class Main {\n  public static void main(String[] args) {\n    int[] values = new int[1];\n    System.out.println(values[4]);\n  }\n}\n',
      input: "",
    },
    timeout: {
      code: "public class Main {\n  public static void main(String[] args) {\n    while (true) {}\n  }\n}\n",
      input: "",
    },
  },
  javascript: {
    hello: {
      code: 'console.log("Hello JavaScript");\n',
      input: "",
    },
    input: {
      code: 'process.stdin.on("data", data => {\n  const name = data.toString().trim();\n  console.log("Hello " + name);\n});\n',
      input: "Roshni",
    },
    "compile-error": {
      code: 'console.log("Missing bracket";\n',
      input: "",
    },
    "runtime-error": {
      code: "missingFunction();\n",
      input: "",
    },
    timeout: {
      code: "while (true) {}\n",
      input: "",
    },
  },
};

const setStatus = (status) => {
  statusBadge.textContent = status;
  statusBadge.className = "status-badge";

  if (status === "Success") {
    statusBadge.classList.add("success");
  } else if (status === "Running" || status === "Idle") {
    statusBadge.classList.add("idle");
  } else if (status.includes("Time")) {
    statusBadge.classList.add("warning");
  } else {
    statusBadge.classList.add("error");
  }
};

const loadSample = () => {
  const language = languageSelect.value;
  const sample = sampleSelect.value;
  const selected = samples[language][sample];

  codeEditor.value = selected.code;
  inputEditor.value = selected.input;
};

const formatResultText = (data) => {
  const parts = [];

  if (data.output) {
    parts.push(data.output.trimEnd());
  }

  if (data.stderr) {
    parts.push(`stderr:\n${data.stderr}`);
  }

  if (data.error) {
    parts.push(`error:\n${data.error}`);
  }

  return parts.filter(Boolean).join("\n\n") || "No output.";
};

const runCode = async () => {
  runButton.disabled = true;
  setStatus("Running");
  timeMetric.textContent = "-";
  exitMetric.textContent = "-";
  outputBox.textContent = "Executing...";

  try {
    const response = await fetch("/execute", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        language: languageSelect.value,
        code: codeEditor.value,
        input: inputEditor.value,
      }),
    });

    const data = await response.json();

    setStatus(data.status || (data.success ? "Success" : "Failed"));
    timeMetric.textContent = typeof data.executionTimeMs === "number" ? `${data.executionTimeMs}ms` : "-";
    exitMetric.textContent = data.exitCode === null || data.exitCode === undefined ? "-" : String(data.exitCode);
    outputBox.textContent = formatResultText(data);
  } catch (error) {
    setStatus("Request Error");
    outputBox.textContent = error.message;
  } finally {
    runButton.disabled = false;
  }
};

languageSelect.addEventListener("change", loadSample);
sampleSelect.addEventListener("change", loadSample);
runButton.addEventListener("click", runCode);

loadSample();
