import { useTranslation } from 'react-i18next'
import {
  GCSimScriptEnergySettings,
  GCSimScriptEnergySettings_EnergyType
} from '../../../genshin/gcsim'

interface EnergySettingsSectionProps {
  energySettings: Partial<GCSimScriptEnergySettings> | undefined
  onChange: (key: keyof GCSimScriptEnergySettings, value: any) => void
}

const EnergySettingsSection = ({
  energySettings,
  onChange
}: EnergySettingsSectionProps) => {
  const { t } = useTranslation()

  return (
    <div className='flex flex-col gap-3'>
      <h4 className='text-sm font-semibold opacity-70'>{t('Energy Settings')}</h4>
      <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4'>
        {/* Energy Type */}
        <div className='form-control'>
          <label className='label'>
            <span className='label-text text-xs'>{t('Energy Type')}</span>
          </label>
          <select
            value={energySettings?.type ?? ''}
            onChange={e =>
              onChange(
                'type',
                e.target.value === '' ? undefined : parseInt(e.target.value)
              )
            }
            className='select select-sm'
          >
            <option value=''>{t('Using script defaults')}</option>
            <option value={GCSimScriptEnergySettings_EnergyType.ONCE}>
              {t('Once')}
            </option>
            <option value={GCSimScriptEnergySettings_EnergyType.EVERY}>
              {t('Every')}
            </option>
          </select>
        </div>

        {/* Start */}
        <div className='form-control'>
          <label className='label'>
            <span className='label-text text-xs'>{t('Start')}</span>
          </label>
          <input
            type='number'
            min='0'
            placeholder={t('Using script defaults')}
            value={energySettings?.start ?? ''}
            onChange={e =>
              onChange('start', e.target.value ? parseInt(e.target.value) : undefined)
            }
            className='input input-sm'
          />
        </div>

        {/* End (only for EVERY type) */}
        <div className='form-control'>
          <label className='label'>
            <span className='label-text text-xs'>{t('End')}</span>
          </label>
          <input
            type='number'
            min='0'
            placeholder={t('Using script defaults')}
            value={energySettings?.end ?? ''}
            onChange={e =>
              onChange('end', e.target.value ? parseInt(e.target.value) : undefined)
            }
            className='input input-sm'
            disabled={
              energySettings?.type !== GCSimScriptEnergySettings_EnergyType.EVERY
            }
          />
        </div>

        {/* Amount */}
        <div className='form-control'>
          <label className='label'>
            <span className='label-text text-xs'>{t('Amount')}</span>
          </label>
          <input
            type='number'
            min='0'
            placeholder={t('Using script defaults')}
            value={energySettings?.amount ?? ''}
            onChange={e =>
              onChange('amount', e.target.value ? parseInt(e.target.value) : undefined)
            }
            className='input input-sm'
          />
        </div>
      </div>
    </div>
  )
}

export default EnergySettingsSection
