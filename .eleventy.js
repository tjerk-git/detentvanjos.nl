module.exports = function (eleventyConfig) {
  // Copy specific folders to output
  eleventyConfig.addPassthroughCopy({ "public": "." });

  return {
    dir: {
      input: ".",
      output: "_site",
      includes: "_includes"
    }
  };
};
