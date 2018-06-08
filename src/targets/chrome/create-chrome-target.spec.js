const createChromeDockerTarget = require('./docker');

const DOCKER_TEST_TIMEOUT = 60000;

const fetchStorybookUrl = async baseUrl => {
  const target = createChromeDockerTarget({ baseUrl });
  await target.start();
  let result;
  try {
    result = await target.getStorybook({ baseUrl });
  } catch (err) {
    result = err;
  }
  await target.stop();
  if (result instanceof Error) {
    throw result;
  }
  return result;
};

const fetchStorybookFixture = async fixture =>
  fetchStorybookUrl(`file:${__dirname}/fixtures/storybook-${fixture}`);

const storybook = [
  {
    kind: 'Welcome',
    stories: ['to Storybook'],
  },
  {
    kind: 'Button',
    stories: ['with text', 'with some emoji'],
    skipped: ['skipped story'],
  },
];

describe('createChromeTarget', () => {
  describe('.getStorybook', () => {
    it(
      'fetches stories from webpack dynamic bundles',
      async () => {
        expect(await fetchStorybookFixture('dynamic')).toEqual(storybook);
      },
      DOCKER_TEST_TIMEOUT
    );

    it(
      'fetches stories from static bundles',
      async () => {
        expect(await fetchStorybookFixture('static')).toEqual(storybook);
      },
      DOCKER_TEST_TIMEOUT
    );

    it(
      'throws if not configured',
      async () => {
        await expect(fetchStorybookFixture('unconfigured')).rejects.toEqual(
          new Error(
            "Loki addon not registered. Add `import 'loki/configure-react'` to your config.js file."
          )
        );
      },
      DOCKER_TEST_TIMEOUT
    );

    it(
      'throws if not running',
      async () => {
        await expect(
          fetchStorybookUrl('http://localhost:23456')
        ).rejects.toEqual(
          new Error('Failed fetching stories because the server is down')
        );
      },
      DOCKER_TEST_TIMEOUT
    );
  });
});
