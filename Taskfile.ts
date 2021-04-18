/* To use Taskfile, it's recommended that you alias this to your shell: 

Unix: alias deno-task='deno run --allow-run $(git rev-parse --show-toplevel)/Taskfile.ts'
Windows PowerShell: Set-Alias -Name deno-task -Value deno run --allow-run ./Taskfile.ts

Thanks to https://dev.to/vonheikemen/a-simple-way-to-replace-npm-scripts-in-deno-4j0g for this idea.
*/

type DenoTask = (...args: any[]) => Promise<Deno.ProcessStatus>;

function run([name, ...args]: string[], tasks: Record<string, DenoTask>): void {
  if (name in tasks) {
    tasks[name](...args);
  } else {
    console.log(`Task "${name}" not found`);
  }
}

async function exec(args: string[]): Promise<Deno.ProcessStatus> {
  const proc = await Deno.run({ cmd: args }).status();

  if (proc.success == false) {
    Deno.exit(proc.code);
  }

  return proc;
}

run(Deno.args, {
  test: () => exec(`deno test --allow-env`.split(" ")),
  fmt: () => exec(`deno fmt`.split(" ")),
  start: (...args) => exec(`deno run --allow-read ./src/main.ts`.split(' ').concat(args)),
});
