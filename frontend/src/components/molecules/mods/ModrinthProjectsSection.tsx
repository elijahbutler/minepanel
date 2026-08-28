'use client';

import Image from 'next/image';
import { HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useLanguage } from '@/lib/hooks/useLanguage';
import { ServerConfig } from '@/lib/types/types';
import { ModLoader } from '@/services/mods/mods-browser.service';
import { ModsListEditor } from './ModsListEditor';

interface ModrinthProjectsSectionProps {
  config: ServerConfig;
  minecraftVersion: string;
  loader?: ModLoader;
  itemType?: 'mod' | 'plugin';
  showVersionFromProjects?: boolean;
  updateConfig: <K extends keyof ServerConfig>(field: K, value: ServerConfig[K]) => void;
  onSearch: () => void;
}

export function ModrinthProjectsSection({
  config,
  minecraftVersion,
  loader,
  itemType = 'mod',
  showVersionFromProjects = false,
  updateConfig,
  onSearch,
}: Readonly<ModrinthProjectsSectionProps>) {
  const { t } = useLanguage();
  const isPlugin = itemType === 'plugin';

  return (
    <>
      <ModsListEditor
        id="modrinthProjects"
        provider="modrinth"
        accent="blue"
        icon="/images/enchanted-book.webp"
        label={t(isPlugin ? 'modrinthPluginProjects' : 'modrinthProjects')}
        description={t(isPlugin ? 'modrinthPluginProjectsDesc' : 'modrinthProjectsDesc')}
        helpText={t(isPlugin ? 'modrinthPluginProjectsHelp' : 'modrinthProjectsHelp')}
        placeholder={isPlugin ? 'luckperms, viaversion, essentialsx' : 'fabric-api, cloth-config, datapack:terralith'}
        browseUrl={isPlugin ? 'https://modrinth.com/plugins' : 'https://modrinth.com/mods'}
        value={config.modrinthProjects || ''}
        minecraftVersion={minecraftVersion}
        loader={loader}
        itemType={itemType}
        onChange={(value) => updateConfig('modrinthProjects', value)}
        onSearch={onSearch}
      />

      {showVersionFromProjects && (
        <div className="space-y-2 p-4 rounded-md bg-gray-800/50 border border-gray-700/50">
          <div className="flex items-center justify-between">
            <Label
              htmlFor="versionFromModrinthProjects"
              className="text-gray-200 font-minecraft text-sm flex items-center gap-2"
            >
              <Image src="/images/compass.webp" alt="Version" width={16} height={16} />
              {t('versionFromModrinthProjects')}
            </Label>
            <Switch
              id="versionFromModrinthProjects"
              checked={config.versionFromModrinthProjects || false}
              onCheckedChange={(checked) => updateConfig('versionFromModrinthProjects', checked)}
            />
          </div>
          <p className="text-xs text-gray-400">{t('versionFromModrinthProjectsDesc')}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2 p-4 rounded-md bg-gray-800/50 border border-gray-700/50">
          <div className="flex items-center justify-between">
            <Label
              htmlFor="modrinthDownloadDependencies"
              className="text-gray-200 font-minecraft text-sm flex items-center gap-2"
            >
              <Image src="/images/hopper.webp" alt="Dependencies" width={16} height={16} />
              {t('modrinthDependencies')}
            </Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 p-0 bg-transparent hover:bg-gray-700/50"
                  >
                    <HelpCircle className="h-4 w-4 text-gray-400" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-gray-800 border-gray-700 text-gray-200">
                  <p>{t('modrinthDependenciesHelp')}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Select
            value={config.modrinthDownloadDependencies || 'none'}
            onValueChange={(value: 'none' | 'required' | 'optional') =>
              updateConfig('modrinthDownloadDependencies', value)
            }
          >
            <SelectTrigger className="bg-gray-800/70 text-gray-200 border-gray-700/50 focus:ring-blue-500/30">
              <SelectValue placeholder="none" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700 text-gray-200">
              <SelectItem value="none">{t('dependenciesNone')}</SelectItem>
              <SelectItem value="required">{t('dependenciesRequired')}</SelectItem>
              <SelectItem value="optional">{t('dependenciesOptional')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 p-4 rounded-md bg-gray-800/50 border border-gray-700/50">
          <div className="flex items-center justify-between">
            <Label
              htmlFor="modrinthDefaultVersionType"
              className="text-gray-200 font-minecraft text-sm flex items-center gap-2"
            >
              <Image src="/images/compass.webp" alt="Version Type" width={16} height={16} />
              {t('modrinthVersionType')}
            </Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 p-0 bg-transparent hover:bg-gray-700/50"
                  >
                    <HelpCircle className="h-4 w-4 text-gray-400" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-gray-800 border-gray-700 text-gray-200">
                  <p>{t('modrinthVersionTypeHelp')}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Select
            value={config.modrinthDefaultVersionType || 'release'}
            onValueChange={(value: 'release' | 'beta' | 'alpha') =>
              updateConfig('modrinthDefaultVersionType', value)
            }
          >
            <SelectTrigger className="bg-gray-800/70 text-gray-200 border-gray-700/50 focus:ring-blue-500/30">
              <SelectValue placeholder="release" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700 text-gray-200">
              <SelectItem value="release">{t('versionRelease')}</SelectItem>
              <SelectItem value="beta">{t('versionBeta')}</SelectItem>
              <SelectItem value="alpha">{t('versionAlpha')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </>
  );
}
