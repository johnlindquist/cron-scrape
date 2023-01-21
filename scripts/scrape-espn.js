// Note: You can extract variables into the yml file
// let url = await arg("Enter URL")
// would allow the following line in the yml
// script: scrape-espn https://espn.com

let url = `https://www.espn.com/nba/lines`
let selector = `.Table__TBODY`
let xf = el => {
  let [home, away] = Array.from(el.querySelectorAll("[data-clubhouse-uid]")).map(e => e.innerText)

  let [homeLine, awayLine] = Array.from(el.querySelectorAll("td:nth-child(3)")).map(e => e.innerText)

  return {
    home,
    homeLine,
    away,
    awayLine,
  }
}

let results = await scrapeSelector(url, selector, xf)

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
