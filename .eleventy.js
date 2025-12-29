module.exports = function (eleventyConfig) {
  // Copy specific folders to output
  eleventyConfig.addPassthroughCopy({ "public": "." });
  eleventyConfig.addPassthroughCopy("robots.txt");

  return {
    dir: {
      input: ".",
      output: "_site",
      includes: "_includes"
    }
  };
};
