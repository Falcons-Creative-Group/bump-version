/**
 * @jest-environment node
 */
const fs = require("fs");

// Import the resolveTagFormat function for testing
const { resolveTagFormat } = require("../src/main");
const { getNextVersion } = require("../src/main");
const { beforeEach } = require("node:test");

describe("resolveTagFormat", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should replace placeholders with current year and month values", () => {
    const result = resolveTagFormat("${year}.${month}", null);
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, "0");
    expect(result).toBe(`${year}.${month}`);
  });

  it("should replace placeholders with year and month values from given version object", () => {
    const result = resolveTagFormat("${year}.${month}", {
      year: 2023,
      month: 4,
    });
    expect(result).toBe("2023.04");
  });

  it("should return the tag format as is if no placeholders are present", () => {
    const result = resolveTagFormat("v1.0.0", null);
    expect(result).toBe("v1.0.0");
  });

  it("should return the tag format containing ${rev} placeholder", () => {
    const result = resolveTagFormat(
      "${year}.${month}-tk-config-default2.1.4.5.${rev}",
      { year: 2023, month: 4 },
    );
    expect(result).toBe("2023.04-tk-config-default2.1.4.5.${rev}");
  });
});

describe("getNextVersion", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns initial version if no tags are provided", () => {
    const tagArray = [];
    const tagFormat = "v1.4.5.${rev}";
    const expected = "v1.4.5.1";
    expect(getNextVersion(tagArray, tagFormat)).toBe(expected);
  });

  it("correctly increments highest revision number", () => {
    const tagArray = ["v1.4.5.1", "v1.4.5.2", "v1.4.5.4"];
    const tagFormat = "v1.4.5.${rev}";
    const expected = "v1.4.5.5";
    expect(getNextVersion(tagArray, tagFormat)).toBe(expected);
  });

  it("handles non-matching tags gracefully", () => {
    const tagArray = ["v1.4.5.1", "release-2", "v1.4.5.2"];
    const tagFormat = "v1.4.5.${rev}";
    const expected = "v1.4.5.3";
    expect(getNextVersion(tagArray, tagFormat)).toBe(expected);
  });

  it("works with different format variations", () => {
    const tagArray = ["product-1.2.1", "product-1.2.2"];
    const tagFormat = "product-1.2.${rev}";
    const expected = "product-1.2.3";
    expect(getNextVersion(tagArray, tagFormat)).toBe(expected);
  });

  it("parses tags with leading zeroes correctly", () => {
    const tagArray = ["v1.0.01", "v1.0.02", "v1.0.10"];
    const tagFormat = "v1.0.${rev}";
    const expected = "v1.0.11";
    expect(getNextVersion(tagArray, tagFormat)).toBe(expected);
  });

  it("handles release candidate versions and increments correctly", () => {
    const tags = ["app-v2-rc1", "app-v2-rc2", "app-v2-rc3"];
    const format = "app-v2";
    expect(getNextVersion(tags, format, true)).toBe("app-v2-rc4");
  });

  it("starts release candidate numbering from 1 if no prior RCs exist", () => {
    const tags = ["app-v2", "app-v3"];
    const format = "app-v4";
    expect(getNextVersion(tags, format, true)).toBe("app-v4-rc1");
  });

  it("correctly identifies the highest revision and rc number among mixed tags", () => {
    const tags = ["app-v1", "app-v2", "app-v3-rc1", "app-v3-rc2"];
    const format = "app-v${rev}";
    expect(getNextVersion(tags, format)).toBe("app-v3");
    expect(getNextVersion(tags, format, true)).toBe("app-v3-rc3");
  });

  it("correctly identifies the highest revision and rc number among mixed tags using real example", () => {
    const tags = [
      "tk-config-default2.1.4.5.1",
      "tk-config-default2.1.4.5.2",
      "tk-config-default2.1.4.5.3-rc1",
      "tk-config-default2.1.4.5.3-rc2",
    ];
    const format = "tk-config-default2.1.4.5.${rev}";
    expect(getNextVersion(tags, format)).toBe("tk-config-default2.1.4.5.3");
    expect(getNextVersion(tags, format, true)).toBe(
      "tk-config-default2.1.4.5.3-rc3",
    );
  });
});
