import { getCookie, setCookies } from 'cookies-next';
import { GetServerSidePropsContext } from 'next';
import path from 'path';
import fs from 'fs';
import { useEffect } from 'react';
import AppShelf from '../components/AppShelf/AppShelf';
import LoadConfigComponent from '../components/Config/LoadConfig';
import { Config } from '../tools/types';
import { useConfig } from '../tools/state';
import { migrateToIdConfig } from '../tools/migrate';
import { ModuleWrapper } from '../components/modules/moduleWrapper';
import { DownloadsModule } from '../components/modules';

export async function getServerSideProps({
  req,
  res,
}: GetServerSidePropsContext): Promise<{ props: { config: Config } }> {
  let cookie = getCookie('config-name', { req, res });
  if (!cookie) {
    setCookies('config-name', 'default', { req, res, maxAge: 60 * 60 * 24 * 30 });
    cookie = 'default';
  }
  // Check if the config file exists
  const configPath = path.join(process.cwd(), 'data/configs', `${cookie}.json`);
  if (!fs.existsSync(configPath)) {
    return {
      props: {
        config: {
          name: cookie.toString(),
          services: [],
          settings: {
            searchUrl: 'https://www.google.com/search?q=',
          },
          modules: {},
        },
      },
    };
  }

  const config = fs.readFileSync(configPath, 'utf8');
  // Print loaded config
  return {
    props: {
      config: JSON.parse(config),
    },
  };
}

export default function HomePage(props: any) {
  const { config: initialConfig }: { config: Config } = props;
  const { config, loadConfig, setConfig, getConfigs } = useConfig();
  useEffect(() => {
    const migratedConfig = migrateToIdConfig(initialConfig);
    setConfig(migratedConfig);
  }, [initialConfig]);
  return (
    <>
      <AppShelf />
      <LoadConfigComponent />
      <ModuleWrapper mt="xl" module={DownloadsModule} />
    </>
  );
}