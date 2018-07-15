## Google Code Jam Fuzzer

### Usage

```bash
./fuzzer.py fuzzer_pattern.fuzz
```

Example input:

```
var T
line T
    sepr
        var A
        var B
    end
    sepr B
        var W
    end
    line B
        seqn A
            char OX.
        end
    end
end

===

T: [1, 10]
A: [2, 8]
B: [2, A+1]    Less than or equal to A
W: f[0, 1.2e4]
```

Example output:

```
3
7 4
312.701364071831 5212.049556219669 8240.96098117144 59.6716830584092
O.OXXOX
OXXOOXX
XOOO.O.
.XO.X..
2 2
9300.970019143322 7180.023793773655
XO
..
6 2
6766.750344540611 960.1983887982794
XO.X..
.OXXXO
```

#### Remaining tasks to refine fuzzer pattern grammar

- Manipulate character appearance probability

