from __future__ import annotations

import argparse
import asyncio
import json
import sys

from gumi.runtime import ingest as ingest_mod
from gumi.runtime.loader import FrozenRuntimeError, load_verified_spec


def _verify(bundle: str) -> int:
    try:
        spec = load_verified_spec(bundle)
    except FrozenRuntimeError as exc:
        print(f"RECHAZADO: {exc}", flush=True)
        return 1
    print(f"OK firma valida -> {spec.name} | {len(spec.tools)} tools | prohibidas: {sorted(spec.forbidden_capabilities)}", flush=True)
    return 0


def _ingest(carpeta: str) -> int:
    resultado = asyncio.run(ingest_mod.ingerir(carpeta))
    print(json.dumps(resultado, ensure_ascii=False), flush=True)
    return 0 if resultado.get("ok") else 1


def _serve(bundle: str) -> int:
    try:
        spec = load_verified_spec(bundle)
    except FrozenRuntimeError as exc:
        print(f"RECHAZADO: no arranco un bundle manipulado -> {exc}", flush=True)
        return 1
    print(f"agente verificado y congelado: {spec.name} | dominio {spec.domain} | {len(spec.tools)} tools", flush=True)
    from gumi.runtime.server import run_server

    run_server(bundle)
    return 0


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(prog="gumi-runtime")
    sub = parser.add_subparsers(dest="cmd", required=True)
    p_verify = sub.add_parser("verify")
    p_verify.add_argument("bundle")
    p_ingest = sub.add_parser("ingest")
    p_ingest.add_argument("carpeta")
    p_serve = sub.add_parser("serve")
    p_serve.add_argument("bundle")
    args = parser.parse_args(argv)
    if args.cmd == "verify":
        return _verify(args.bundle)
    if args.cmd == "ingest":
        return _ingest(args.carpeta)
    if args.cmd == "serve":
        return _serve(args.bundle)
    return 2


if __name__ == "__main__":
    sys.exit(main())
