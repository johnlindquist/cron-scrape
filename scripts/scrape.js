let url = await arg("Enter url")
let selector = await arg("Enter selector")

let data = await scrapeSelector(url, selector)

console.log({ data })

// Rest of this script is for uploading the data to GitHub releases
let octokit = github.getOctokit(await env("GITHUB_TOKEN"))

console.log({ octokit })

let { format } = await npm("date-fns")
let dateTag = format(new Date(), "yyyy-MM-dd-HH-mm")

let releaseResponse = await octokit.rest.repos.createRelease({
  ...github.context.repo,
  tag_name: dateTag,
})

let { host } = new URL(url)

let uploadResponse = await octokit.rest.repos.uploadReleaseAsset({
  headers,
  ...github.context.repo,
  release_id: releaseResponse.data.id,
  name: `${host}-${dateTag}.json`,
  data,
})

console.log(`url: ${uploadResponse.data.browser_download_url}`)
