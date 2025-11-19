import { useTranslation } from 'react-i18next'
import { GCSimScriptOptions } from '../../../genshin/gcsim'

interface ScriptOptionsSectionProps {
  options: Partial<GCSimScriptOptions> | undefined
  onChange: (key: keyof GCSimScriptOptions, value: any) => void
}

const ScriptOptionsSection = ({ options, onChange }: ScriptOptionsSectionProps) => {
  const { t } = useTranslation()

  return (
    <div className='flex flex-col gap-3'>
      <h4 className='text-sm font-semibold opacity-70'>{t('Script Options')}</h4>
      <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4'>
        {/* Iterations */}
        <div className='form-control'>
          <label className='label'>
            <span className='label-text text-xs'>{t('Iterations')}</span>
          </label>
          <input
            type='number'
            min='1'
            placeholder={t('Using script defaults')}
            value={options?.iteration ?? ''}
            onChange={e =>
              onChange(
                'iteration',
                e.target.value ? parseInt(e.target.value) : undefined
              )
            }
            className='input input-bordered input-sm'
          />
        </div>

        {/* Workers */}
        <div className='form-control'>
          <label className='label'>
            <span className='label-text text-xs'>{t('Workers')}</span>
          </label>
          <input
            type='number'
            min='1'
            placeholder={t('Using script defaults')}
            value={options?.workers ?? ''}
            onChange={e =>
              onChange(
                'workers',
                e.target.value ? parseInt(e.target.value) : undefined
              )
            }
            className='input input-bordered input-sm'
          />
        </div>

        {/* Duration */}
        <div className='form-control'>
          <label className='label'>
            <span className='label-text text-xs'>{t('Duration (seconds)')}</span>
          </label>
          <input
            type='number'
            min='1'
            placeholder={t('Using script defaults')}
            value={options?.duration ?? ''}
            onChange={e =>
              onChange(
                'duration',
                e.target.value ? parseInt(e.target.value) : undefined
              )
            }
            className='input input-bordered input-sm'
          />
        </div>

        {/* Ignore Burst Energy */}
        <div className='form-control'>
          <label className='label'>
            <span className='label-text text-xs'>{t('Ignore Burst Energy')}</span>
          </label>
          <select
            value={
              options?.ignoreBurstEnergy === undefined
                ? ''
                : options?.ignoreBurstEnergy
                ? 'true'
                : 'false'
            }
            onChange={e =>
              onChange(
                'ignoreBurstEnergy',
                e.target.value === '' ? undefined : e.target.value === 'true'
              )
            }
            className='select select-bordered select-sm'
          >
            <option value=''>{t('Using script defaults')}</option>
            <option value='true'>{t('Yes')}</option>
            <option value='false'>{t('No')}</option>
          </select>
        </div>
      </div>
    </div>
  )
}

export default ScriptOptionsSection
