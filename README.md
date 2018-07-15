# ps-fuzzer

## Tools

### fuzzer

#### Installation

1. Set the environment variable pointing this repository's directory.
    Add this line in your profile (e.g. `.bashrc`):

    ```bash
    export GCJ_TEMPLATE_DIR="$HOME/.../codejam-template"
    ```

2. Add an alias.

    ```bash
    alias fuzzer="$GCJ_TEMPLATE_DIR/fuzzer/fuzzer.py"
    ```

3. Test your code with `fuzzer`.

    ```bash
    fuzzer fuzzer_pattern.fuzz | your_executable
    ```

### py

Simple wrapper around Python with debug comments and fuzzer.

#### Installation

1. Set the environment variable `$GCJ_TEMPLATE_DIR`.

2. Load `py` in the shell. Add the source line in your profile:

    ```bash
    [ -s "$GCJ_TEMPLATE_DIR/py/py.sh" ] && \. "$GCJ_TEMPLATE_DIR/py/py.sh"
    ```

    or source it manually.

    ```bash
    . ~/.../codejam-template/py/py.sh
    ```

3. Write some code with debug comment (e.g. `## print('hello')`).
   Debug comment line will be uncommented when `-d` option is present.

4. Debug your code with fuzzer (`-f` option).

    ```bash
    py -df your-code.py
    ```
