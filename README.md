## Google Code Jam template code & fuzzer

#### Usage

1. Activate GCJ environment by sourcing it. (TODO)
2. Write some code with debug comment `# DEBUG: ...`.
   Debug comment line will be uncommented with `-d` option.
3. Test with fuzzer.
    ```bash
    py -d -f your-code.py
    ```
