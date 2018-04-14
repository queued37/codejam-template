#!/usr/bin/env python
import random
import sys
import re

FUZZER_PATTERN_EXTENSION = '.fuzz'


def parse(raw_pattern):
    pattern = [x.rstrip('\n') for x in raw_pattern if x != '\n']
    separator = pattern.index('===')

    raw_instruction = pattern[:separator]
    instruction = [x.lstrip().split() for x in raw_instruction]

    limits = pattern[separator+1:]

    return instruction, limits


class Iteration:
    total_count, starting_line = 1, None
    count = 0
    scope_type = 'line'    # line | sepr | seqn

    def __init__(self, total_count, line, scope_type='line', count=0):
        self.total_count = total_count
        self.starting_line = line
        self.count = count
        self.scope_type = scope_type

    def step(self):
        self.count += 1
        return self.count == self.total_count


def interpret(inst, limits):
    separator = {'line': '\n', 'sepr': ' ', 'seqn': ''}
    iteration_stack = [Iteration(1, -1)]
    variables = {'_': 1}
    output = []
    i = 0    # Line number

    while i < len(inst):
        if inst[i][0] == 'var':
            var_name = inst[i][1]
            variables[var_name] = random.randint(2, 8)      # TODO: Apply limits
            output.append(variables[var_name])
            output.append(separator[iteration_stack[-1].scope_type])
        if inst[i][0] == 'char':
            char_list = inst[i][1]
            rand_char = random.randrange(len(char_list))    # TODO: Manipulate probability
            output.append(char_list[rand_char])
            output.append(separator[iteration_stack[-1].scope_type])
        if inst[i][0] == 'line' or inst[i][0] == 'sepr' or inst[i][0] == 'seqn':
            if len(inst[i]) == 1:
                var_name = '_'
            else:
                var_name = inst[i][1]
            iteration_stack.append(Iteration(variables[var_name], i, inst[i][0]))
        if inst[i][0] == 'end':
            if not iteration_stack[-1].step():
                i = iteration_stack[-1].starting_line
            else:
                iteration_stack.pop()
                output.append(separator[iteration_stack[-1].scope_type])

        # DEBUG: print(i, variables, list(map(lambda x: x.count, iteration_stack)))
        i += 1

    return ''.join(map(str, output))


def main():
    if len(sys.argv) <= 1:
        print("Usage: ./fuzzer.py fuzzer_pattern.fuzz")
        return 1

    file_name = sys.argv[1]
    if not re.search(re.compile('{}$'.format(FUZZER_PATTERN_EXTENSION)), file_name):
        file_name += FUZZER_PATTERN_EXTENSION

    with open(file_name) as f:
        raw_content = f.readlines()

    instruction, limits = parse(raw_content)
    output = interpret(instruction, limits)
    print(output)


if __name__ == '__main__':
    main()
