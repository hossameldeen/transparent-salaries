/**
 * TODO: This is a work-in-progress. Don't know if will continue to work on it or no. Committing into into git anyway.
 */

// Reminder to self: use `concurrently` even if you'll call one command. Probably simpler to manage than spawn_process.

// TODO: It needs watch, @types/watch, and count-in-files, packages. They were removed because this is currently on-halt.

// TODO: Add prod option

const assert = require('assert')
const concurrently = require('concurrently')
const watch = require('watch')
const countLinesInFile = require('count-lines-in-file');
const path = require('path');

function cmdStr(projectName, outputPath) {
  return `ng build ${projectName} --watch --output-path=${outputPath} --delete-output-path=false`
}

function editWorkerMain(sharedWorkerRoot, reject) {
  try {
    watch.unwatchTree(sharedWorkerRoot)

    const workerMainFilePath = path.resolve(__dirname, `${sharedWorkerRoot}/main.js`)

    // TODO: Ignores the following scenario: ng outputs a new main.js while we're editing it

    const numberOfLines = await new Promise((resolve, reject) => countLinesInFile(targetFilePath, (error, numberOfLines) => {
      if (error)
        reject(error)
      else
        resolve(numberOfLines)
    }))

    // TODO: I stopped here. Next is editing main.js file
  }
  catch(e) {
    reject(e)
  }
  watch.watchTree(sharedWorkerRoot, () => editWorkerMain(sharedWorkerRoot, reject))
}

function watch(outputPath) {
  return Promise.race([
    concurrently([
      cmdStr('salary-transparency', `${outputPath}`),
      cmdStr('shared-worker', `${outputPath}/assets/shared-worker`)
    ]),
    new Promise((_, reject) => watch.watchTree(`${outputPath}/assets/shared-worker`,
      () => editWorkerMain(`${outputPath}/assets/shared-worker`, reject)
    ))
  ])
}

(async function() {
  assert(process.argv.length >= 2, "Internal error: thoughts args should begin with 'node' and script path")

  assert(process.argv.length >= 3, "You didn't give a command to build.js")

  console.log("Note: The script isn't meant to be bulletproof; it has many assumptions baked in like the directory it's run from.")

  if (process.argv[2] === 'build') {
    console.log("Received build command")
    throw new Error("build command not implemented yet")
  }
  else if (process.argv[2] === 'watch') {
    console.log("Received watch command")
    
    let outputPath;
    
    if (process.argv.length > 3) {
      console.log(`Received output path = ${process.argv[3]}`)
      outputPath = process.argv[3]
      if (outputPath.endsWith('/')) {
        outputPath = outputPath.slice(0, -1)
      }
    }
    else {
      console.log(`No output path received. Assumed it to be "dist". How that working-directory will be interepted by node/ng, I don't know.`)
      outputPath = 'dist'
      // TODO: You may be interested in where the output will be exactly because that's where you'll listen for changes
    }

    console.log('started watching')
    console.log("Note: it doesn't delete the output path & doesn't output all files at once; even edits some after outputting")

    // Note: starts something in the background
    try {
      await watch(outputPath)
    }
    finally {
      console.log('internal error!! one (or more) of the watches stopped. Please, stop the script with Ctrl-C')
    }

  }
  else {
    assert(false, `Command '${process.argv[2]}' not recognized. Available commands are build & watch`)
  }
})();
