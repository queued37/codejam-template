## Google Code Jam Fuzzer

### Usage

```bash
./fuzzer.py fuzzer_pattern.fuzz
```

Example input (grammar is likely to be changed):

```
var T
line T
    sepr
        var N
        var K
    end
    sepr
        var P
        sepr P
            char abc
        end
        seqn N
            char .*@
        end
    end
    line N
        seqn K
            char OX
        end
    end
end

===

T: [1, 10]
N: [3, 10]
P: [3, 10]
```

Example output:

```
3
6 7
7 a a c a b a a .*.*@@
XOXOOXX
OXXOOOO
OOXXOXX
XXOXXXX
XXXOXXX
OXOOXXO
4 3
8 b c a a a b b b @.**
XOO
XXO
XOX
OOO
6 4
7 a a c a b a a *@.@*.
OOOO
XXXX
OOXO
OXXX
XXOX
OXOX
```

#### Remaining tasks to refine fuzzer pattern grammar

- Add a syntax `var A B C` as an alias for
    ```
    sepr
        var A
        var B
        var C
    end
    ```
- Apply limits
- Manipulate character appeearance probability
- Add variable types (int, float)
