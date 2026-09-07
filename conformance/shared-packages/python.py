from __future__ import annotations

import configparser
import shutil
import subprocess
import sys
import tempfile
import tomllib
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
CONSUMER_ROOT = ROOT / "fastapi-template-monolith"
PACKAGES = (
    ("ruff-config-shared", "teo-ruff-config-shared", "teo-ruff-config-path"),
    ("mypy-config-shared", "teo-mypy-config-shared", "teo-mypy-config-path"),
    ("pytest-config-shared", "teo-pytest-config-shared", "teo-pytest-config-path"),
)


def run(*command: str | Path, cwd: Path, capture: bool = False) -> str:
    result = subprocess.run(
        [str(part) for part in command],
        check=True,
        cwd=cwd,
        text=True,
        stdout=subprocess.PIPE if capture else None,
    )
    return result.stdout.strip() if capture else ""


with (CONSUMER_ROOT / "pyproject.toml").open("rb") as source:
    consumer_project = tomllib.load(source)

declared = consumer_project["dependency-groups"]["dev"]
for _, project_name, _ in PACKAGES:
    if not any(item.startswith(f"{project_name}==") for item in declared):
        raise RuntimeError(f"fastapi-template-monolith must declare {project_name}")

with tempfile.TemporaryDirectory(prefix="templates-python-consumer-") as temporary:
    temp_root = Path(temporary)
    consumer = temp_root / "consumer"
    wheels = temp_root / "wheels"
    wheels.mkdir()

    tracked_files = run("git", "ls-files", cwd=CONSUMER_ROOT, capture=True).splitlines()
    for relative_path in tracked_files:
        source = CONSUMER_ROOT / relative_path
        target = consumer / relative_path
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source, target)

    for directory, _, _ in PACKAGES:
        run("uv", "build", "--wheel", "--out-dir", wheels, ROOT / directory, cwd=ROOT)

    built_wheels = sorted(wheels.glob("*.whl"))
    if len(built_wheels) != len(PACKAGES):
        raise RuntimeError("each Python shared package must produce exactly one wheel")

    run("uv", "sync", "--frozen", "--python", sys.executable, cwd=consumer)
    virtual_python = consumer / ".venv" / "bin" / "python"
    run(
        "uv",
        "pip",
        "install",
        "--python",
        virtual_python,
        "--reinstall",
        *built_wheels,
        cwd=consumer,
    )

    bin_dir = virtual_python.parent
    virtual_environment = (consumer / ".venv").resolve()
    config_paths: dict[str, Path] = {}
    for _, project_name, command in PACKAGES:
        config_path = Path(run(bin_dir / command, cwd=consumer, capture=True)).resolve()
        if not config_path.is_file() or not config_path.is_relative_to(virtual_environment):
            raise RuntimeError(f"{project_name} did not export its installed config")
        config_paths[project_name] = config_path

    mypy_config = configparser.ConfigParser()
    mypy_config.read(config_paths["teo-mypy-config-shared"])
    consumer_mypy = consumer_project["tool"]["mypy"]
    if mypy_config["mypy"].getboolean("strict") is not consumer_mypy["strict"]:
        raise RuntimeError("FastAPI mypy strict mode drifted from the shared baseline")
    if mypy_config["mypy"]["python_version"] != consumer_mypy["python_version"]:
        raise RuntimeError("FastAPI mypy Python target drifted from the shared baseline")

    pytest_config = configparser.ConfigParser()
    pytest_config.read(config_paths["teo-pytest-config-shared"])
    consumer_pytest = consumer_project["tool"]["pytest"]["ini_options"]
    if pytest_config["pytest"]["asyncio_mode"] != consumer_pytest["asyncio_mode"]:
        raise RuntimeError("FastAPI asyncio mode drifted from the shared baseline")
    if pytest_config["pytest"]["testpaths"] not in consumer_pytest["testpaths"]:
        raise RuntimeError("FastAPI test path drifted from the shared baseline")
    shared_strict_markers = pytest_config["pytest"].getboolean("strict_markers")
    consumer_strict_markers = "--strict-markers" in consumer_pytest["addopts"]
    if shared_strict_markers and not consumer_strict_markers:
        raise RuntimeError("FastAPI strict markers drifted from the shared baseline")

    (consumer / "ruff.extend.toml").write_text(
        f'extend = "{config_paths["teo-ruff-config-shared"]}"\n', encoding="utf-8"
    )
    run(bin_dir / "ruff", "check", ".", cwd=consumer)
    run(bin_dir / "ruff", "format", "--check", ".", cwd=consumer)
    run(bin_dir / "mypy", ".", cwd=consumer)
    run(
        bin_dir / "pytest",
        "--cov",
        "--cov-report=term-missing",
        "--cov-report=xml",
        "--cov-report=lcov",
        "--cov-report=html",
        cwd=consumer,
    )

print("Python shared packages passed in fastapi-template-monolith")
