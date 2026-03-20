import { execFile } from "child_process";
import { promisify } from "util";
import path from "path";
import fs from "fs/promises";

const execFileAsync = promisify(execFile);

export async function runClaudeAgent(userPrompt: string): Promise<unknown[]> {
  const systemPromptPath = path.join(process.cwd(), ".personas", "KORE_SYSTEM_PROMPT.md");
  const systemPrompt = await fs.readFile(systemPromptPath, "utf-8");

  const { stdout } = await execFileAsync("claude", [
    "-p",
    userPrompt,
    "--system-prompt",
    systemPrompt,
    "--output-format",
    "text",
  ]);

  // Extract JSON array from output (claude may wrap it in markdown)
  const match = stdout.match(/\[[\s\S]*\]/);
  if (!match) throw new Error("Agent returned no JSON array");

  return JSON.parse(match[0]);
}
