"""Simple educational CLI chatbot for Ollama.

This demo shows the basic flow of an LLM app:
1. Preload the model for faster first response.
2. Read user input from the terminal.
3. Send the prompt to an LLM server.
4. Stream the model's reasoning (if any) and tokens back to the screen.

Run:
    python ollama_chatbot.py

Optional:
    python ollama_chatbot.py --model llama3.2
"""

# pyright: reportAny=false

from __future__ import annotations

import argparse
import json
import importlib
import sys
from collections.abc import Iterable
from typing import cast

try:
    requests = importlib.import_module("requests")
except ImportError:  # pragma: no cover - helps beginners install the dependency
    print("Missing dependency: requests. Install it with: pip install requests")
    sys.exit(1)


OLLAMA_URL = "http://100.120.93.35:11434"


def is_quit_message(text: str) -> bool:
    """Return True when the user wants to leave the chat."""

    return text.strip().lower() in {"bye", "exit", "quit", "q"}


def is_greeting(text: str) -> bool:
    """Very small greeting detector for the demo."""

    return text.strip().lower() in {"hi", "hello", "hey"}


def preload_model(model: str) -> None:
    """Preload/warm up the model so first response is fast."""

    print(f"[Loading {model}...]", end=" ", flush=True)

    # Send a minimal generation to load the model into memory
    payload = {
        "model": model,
        "prompt": "hi",
        "stream": False,
        "options": {"num_tokens": 1},
    }

    try:
        response = requests.post(
            f"{OLLAMA_URL}/api/generate",
            json=payload,
            timeout=180,
        )
        response.raise_for_status()
    except requests.exceptions.RequestException as exc:
        raise RuntimeError(f"Could not preload model: {exc}") from exc

    print("ready!\n")


def build_messages(user_text: str) -> list[dict[str, str]]:
    """Build chat messages with teaching context."""

    return [
        {
            "role": "system",
            "content": "You are an educational assistant for a class demo. "
            "Explain concepts clearly and briefly, as if teaching how LLM chatbots work.",
        },
        {"role": "user", "content": user_text},
    ]


def stream_ollama_response(model: str, messages: list[dict[str, str]]) -> str:
    """Send chat messages to Ollama and stream reasoning + reply token by token."""

    payload = {
        "model": model,
        "messages": messages,
        "stream": True,
    }

    try:
        response = requests.post(f"{OLLAMA_URL}/api/chat", json=payload, stream=True, timeout=120)
        response.raise_for_status()
    except requests.exceptions.RequestException as exc:
        raise RuntimeError(f"Could not reach Ollama at {OLLAMA_URL}: {exc}") from exc

    full_text: list[str] = []
    reasoning_shown = False

    lines = cast(Iterable[str], response.iter_lines(decode_unicode=True))
    for raw_line in lines:
        if not raw_line:
            continue

        chunk = cast(dict[str, object], json.loads(raw_line))
        message = cast(dict[str, object], chunk.get("message", {}))
        reason = cast(str, message.get("reasoning_content", ""))
        if reason and not reasoning_shown:
            print(f"[Reasoning] {reason}", flush=True)
            reasoning_shown = True

        content = cast(str, message.get("content", ""))
        if content:
            print(content, end="", flush=True)
            full_text.append(content)

        if bool(chunk.get("done")):
            break

    print()
    return "".join(full_text)


def chat_loop(model: str) -> None:
    preload_model(model)

    print(f"Ollama chatbot demo using model: {model}")
    print('Type a message, or "bye" to exit.\n')

    while True:
        try:
            user_text = input("You: ").strip()
        except (EOFError, KeyboardInterrupt):
            print("\nBye!")
            break

        if not user_text:
            continue

        if is_quit_message(user_text):
            print("Bot: Bye!")
            break

        if is_greeting(user_text):
            print("Bot: Hello! I am a simple CLI chatbot powered by Ollama.")
            continue

        print("Bot: ", end="", flush=True)
        try:
            _ = stream_ollama_response(model, build_messages(user_text))
        except RuntimeError as exc:
            print(f"\nError: {exc}")
            print("Tip: make sure Ollama is running and reachable on port 11434.")


def parse_args(argv: Iterable[str]) -> argparse.Namespace:
    """Parse command-line options."""

    parser = argparse.ArgumentParser(description="Simple CLI chatbot for Ollama")
    _ = parser.add_argument(
        "--model",
        default="huihui_ai/qwen3.5-abliterated:2B",
        help='Ollama model name to use (default: "huihui_ai/qwen3.5-abliterated:2B")',
    )
    return parser.parse_args(list(argv))


def main() -> None:
    args = parse_args(sys.argv[1:])
    model = str(getattr(args, "model", "huihui_ai/qwen3.5-abliterated:2B"))
    chat_loop(model)


if __name__ == "__main__":
    main()
