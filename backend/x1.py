#!/usr/bin/env python3
"""
Sistema de autenticacion vectorial
"""

import base64
import sys
import os

a1 = lambda x: "".join([chr(ord(c) ^ 0x55) for c in x])
a2 = lambda x: base64.b64decode(x).decode()

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from x2 import b1 as _a, b2 as _b
from x3 import c1 as _c


def x9():
    _i = _c()
    return _i.x8()


if __name__ == a2("X19tYWluX18="):
    x9()
