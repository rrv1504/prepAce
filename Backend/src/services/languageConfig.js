const cppConfig = {
  image: 'gcc:latest',
  fileName: 'main.cpp',
  compile: 'g++ main.cpp -o main',
  run: './main',
}

module.exports = {
  c: {
    image: "gcc:latest",
    fileName: "main.c",
    compile: "gcc main.c -o main",
    run: "./main",
  },
  cpp: cppConfig,
  "c++": cppConfig,
  java: {
    image: "eclipse-temurin:21-jdk",
    fileName: "Main.java",
    compile: "javac Main.java",
    run: "java Main",
  },
  javascript: {
    image: "node:22-alpine",
    fileName: "main.js",
    compile: null,
    run: "node main.js",
  },
  python: {
    image: "python:3.12-alpine",
    fileName: "main.py",
    compile: null,
    run: "python main.py",
  },
};
