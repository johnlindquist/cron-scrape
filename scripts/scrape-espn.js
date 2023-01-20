// Note: You can extract variables into the yml file
// let url = await arg("Enter URL")
// would allow the following line in the yml
// script: scrape-espn https://espn.com

let url = `https://espn.com`
let selector = `[data-mptype="headline"]`

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
