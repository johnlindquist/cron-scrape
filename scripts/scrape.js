let url = await arg("Enter url")
let selector = await arg("Enter selector")

let results = await scrapeSelector(url, selector)

// Rest of this script is for uploading the data to GitHub releases
let octokit = github.getOctokit(await env("GITHUB_TOKEN"))

let { format } = await npm("date-fns")
let dateTag = format(new Date(), "yyyy-MM-dd-HH-mm")
let { host } = new URL(url)

let name = `${host}-${dateTag}.json`

let releaseResponse = await octokit.rest.repos.createRelease({
  ...github.context.repo,
  tag_name: name,
})

let headers = {
  "content-type": "application/json",
}

let uploadResponse = await octokit.rest.repos.uploadReleaseAsset({
  headers,
  ...github.context.repo,
  release_id: releaseResponse.data.id,
  name,
  data: Buffer.from(JSON.stringify(results)),
})
