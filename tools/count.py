#!/usr/bin/env python3
# Counts the lines of code (not blank, not only comments) and the tokens of
# JavaScript and Atmos files, from tools/count.py of ia-atmos/env-ray:
#
#   tools/count.py <files>...     prints: lines tokens
#
# Atmos: the lines between `;; [trace]` and `;; [/trace]` are left out, since
# the trace only serves the comparison with the original. Strings and native
# literals count as one token each. The kind is taken from the extension.

import re, sys

J_TOK = re.compile(r'"(?:\\.|[^"\\])*"|\'(?:\\.|[^\'\\])*\'|[A-Za-z_$][\w$]*|\d[\w.]*|===|!==|=>|\+\+|--|<<=|>>=|<=|>=|==|!=|&&|\|\||[-+*/%&|^]=|<<|>>|\S')
A_TOK = re.compile(r'"(?:\\.|[^"\\])*"|\'(?:\\.|[^\'\\])*\'|`[^`]*`|:[A-Za-z0-9_.]+|[A-Za-z_]\w*|\d[\w.]*|<--|-->|<-|->|\+\+|==|!=|\?\?|!\?|<=|>=|&&|\|\||//|=>|::|\.\.\.|<<|>>|\S')

def js_count(src):
    src = re.sub(r'/\*.*?\*/', lambda m: '\n' * m.group(0).count('\n'), src, flags=re.S)
    src = re.sub(r'(?<![:\\])//[^\n]*', '', src)
    lines = [l for l in src.split('\n') if l.strip()]
    return len(lines), len(J_TOK.findall('\n'.join(lines)))

def atm_count(src):
    src = re.sub(r';; \[trace\].*?;; \[/trace\]', '', src, flags=re.S)
    src = re.sub(r'```.*?```', lambda m: 'NATIVE' + '\n' * m.group(0).count('\n'), src, flags=re.S)
    src = re.sub(r'(;;;+)\n.*?\n\1', lambda m: '\n' * m.group(0).count('\n'), src, flags=re.S)
    src = re.sub(r';;[^\n]*', '', src)
    lines = [l for l in src.split('\n') if l.strip()]
    return len(lines), len(A_TOK.findall('\n'.join(lines)))

L = T = 0
for f in sys.argv[1:]:
    src = open(f).read()
    l, t = js_count(src) if f.endswith('.js') else atm_count(src)
    L += l; T += t
print(L, T)
