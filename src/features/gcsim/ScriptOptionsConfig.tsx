import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  GCSimScriptOptions,
  GCSimScriptEnergySettings,
  GCSimScriptTarget
} from '../../genshin/gcsim'
import ScriptOptionsSection from './options/ScriptOptionsSection'
import EnergySettingsSection from './options/EnergySettingsSection'
import TargetSettingsSection from './options/TargetSettingsSection'

export interface ScriptOverrides {
  options?: Partial<GCSimScriptOptions>
  energySettings?: Partial<GCSimScriptEnergySettings>
  target?: Partial<GCSimScriptTarget>
}

interface ScriptOptionsConfigProps {
  overrides: ScriptOverrides
  onChange: (overrides: ScriptOverrides) => void
  onClear: () => void
}

const ScriptOptionsConfig = ({
  overrides,
  onChange,
  onClear
}: ScriptOptionsConfigProps) => {
  const { t } = useTranslation()
  const [isExpanded, setIsExpanded] = useState(false)

  const hasOverrides = () => {
    return (
      (overrides.options && Object.keys(overrides.options).length > 0) ||
      (overrides.energySettings &&
        Object.keys(overrides.energySettings).length > 0) ||
      (overrides.target && Object.keys(overrides.target).length > 0)
    )
  }

  const updateOption = (key: keyof GCSimScriptOptions, value: any) => {
    const newOptions = { ...overrides.options }
    if (value === undefined || value === null || value === '') {
      delete newOptions[key]
    } else {
      newOptions[key] = value
    }
    onChange({ ...overrides, options: newOptions })
  }

  const updateEnergySettings = (
    key: keyof GCSimScriptEnergySettings,
    value: any
  ) => {
    const newSettings = { ...overrides.energySettings }
    if (value === undefined || value === null || value === '') {
      delete newSettings[key]
    } else {
      newSettings[key] = value
    }
    onChange({ ...overrides, energySettings: newSettings })
  }

  const updateTarget = (key: keyof GCSimScriptTarget, value: any) => {
    const newTarget = { ...overrides.target }
    if (value === undefined || value === null || value === '') {
      delete newTarget[key]
    } else {
      newTarget[key] = value
    }
    onChange({ ...overrides, target: newTarget })
  }

  return (
    <div className='border-base-300 bg-base-200 border rounded-lg'>
      {/* Header - clickable to toggle */}
      <div
        className='flex cursor-pointer items-center justify-between p-4 transition-colors hover:bg-base-300'
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className='flex items-center gap-2'>
          <svg
            className={`h-5 w-5 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M9 5l7 7-7 7'
            />
          </svg>
          <h3 className='text-lg font-bold'>{t('Script Options')}</h3>
        </div>
        <div className='flex items-center gap-2'>
          {hasOverrides() && (
            <span className='text-xs opacity-70'>
              {t('Custom overrides active')}
            </span>
          )}
          <button
            onClick={e => {
              e.stopPropagation()
              onClear()
            }}
            disabled={!hasOverrides()}
            className='btn btn-outline btn-sm'
          >
            {t('Clear Overrides')}
          </button>
        </div>
      </div>

      {/* Collapsible content */}
      {isExpanded && (
        <div className='border-t border-base-300 p-4'>
          <div className='flex flex-col gap-4'>
            <ScriptOptionsSection
              options={overrides.options}
              onChange={updateOption}
            />

            <EnergySettingsSection
              energySettings={overrides.energySettings}
              onChange={updateEnergySettings}
            />

            <TargetSettingsSection
              target={overrides.target}
              onChange={updateTarget}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default ScriptOptionsConfig
