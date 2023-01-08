import axios from 'axios';
import Consola from 'consola';
import { ActionIcon, Button, Group, Title, Tooltip } from '@mantine/core';
import { IconEditCircle, IconEditCircleOff } from '@tabler/icons';
import { getCookie } from 'cookies-next';
import { Trans, useTranslation } from 'next-i18next';
import { hideNotification, showNotification } from '@mantine/notifications';
import { useConfigContext } from '../../../../../config/provider';
import { useScreenSmallerThan } from '../../../../../hooks/useScreenSmallerThan';

import { useEditModeStore } from '../../../../Dashboard/Views/useEditModeStore';
import { AddElementAction } from '../AddElementAction/AddElementAction';

export const ToggleEditModeAction = () => {
  const { enabled, toggleEditMode } = useEditModeStore();

  const { t } = useTranslation('layout/header/actions/toggle-edit-mode');

  const smallerThanSm = useScreenSmallerThan('sm');
  const { config } = useConfigContext();

  const toggleButtonClicked = () => {
    toggleEditMode();
    if (enabled || config === undefined || config?.schemaVersion === undefined) {
      const configName = getCookie('config-name')?.toString() ?? 'default';
      axios.put(`/api/configs/${configName}`, { ...config });
      Consola.log('Saved config to server', configName);
      hideNotification('toggle-edit-mode');
    } else if (!enabled) {
      showNotification({
        styles: (theme) => ({
          root: {
            backgroundColor: theme.colors.orange[7],
            borderColor: theme.colors.orange[7],

            '&::before': { backgroundColor: theme.white },
          },
          title: { color: theme.white },
          description: { color: theme.white },
          closeButton: {
            color: theme.white,
            '&:hover': { backgroundColor: theme.colors.orange[7] },
          },
        }),
        radius: 'md',
        id: 'toggle-edit-mode',
        autoClose: false,
        title: <Title order={4}>{t('popover.title')}</Title>,
        message: <Trans i18nKey="layout/header/actions/toggle-edit-mode:popover.text" />,
      });
    } else {
      hideNotification('toggle-edit-mode');
    }
  };

  const ToggleButtonDesktop = () => (
    <Tooltip label={enabled ? t('button.enabled') : t('button.disabled')}>
      <Button
        onClick={() => toggleButtonClicked()}
        radius="md"
        variant="default"
        style={{ height: 43 }}
      >
        {enabled ? <IconEditCircleOff /> : <IconEditCircle />}
      </Button>
    </Tooltip>
  );

  const ToggleActionIconMobile = () => (
    <ActionIcon
      onClick={() => toggleButtonClicked()}
      variant="default"
      radius="md"
      size="xl"
      color="blue"
    >
      {enabled ? <IconEditCircleOff /> : <IconEditCircle />}
    </ActionIcon>
  );

  return (
    <>
      {smallerThanSm ? (
        enabled ? (
          <Group style={{ flexWrap: 'nowrap' }}>
            <AddElementAction type="action-icon" />
            <ToggleActionIconMobile />
          </Group>
        ) : (
          <ToggleActionIconMobile />
        )
      ) : enabled ? (
        <Button.Group>
          <ToggleButtonDesktop />
          {enabled && <AddElementAction type="button" />}
        </Button.Group>
      ) : (
        <ToggleButtonDesktop />
      )}
    </>
  );
};
