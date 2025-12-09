import { useTranslation } from 'react-i18next'
import { GCSimScriptTarget } from '../../../genshin/gcsim'
import { Enemy, enemyToJSON } from '../../../genshin/enemy'

interface TargetSettingsSectionProps {
  target: Partial<GCSimScriptTarget> | undefined
  onChange: (key: keyof GCSimScriptTarget, value: any) => void
}

const TargetSettingsSection = ({ target, onChange }: TargetSettingsSectionProps) => {
  const { t } = useTranslation()

  // Get enemy type name as lowercase for translation
  const getEnemyKey = (enemy: Enemy): string => {
    return enemyToJSON(enemy).toLowerCase()
  }

  // Get all available enemy types
  const enemyTypes = Object.values(Enemy).filter(
    v => typeof v === 'number' && v !== Enemy.ENEMY_UNSPECIFIED
  ) as Enemy[]

  return (
    <div className='flex flex-col gap-4'>
      <h4 className='text-sm font-semibold opacity-70'>{t('Target Settings')}</h4>

      {/* Enemy Type Section */}
      <div className='rounded-lg bg-base-300 p-3'>
        <div className='mb-2 text-xs font-semibold opacity-70'>Enemy Configuration</div>
        <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3'>
          {/* Enemy Type */}
          <div className='form-control'>
            <label className='label py-1'>
              <span className='label-text text-xs'>{t('Enemy Type')}</span>
            </label>
            <select
              value={target?.type?.typeName ?? ''}
              onChange={e => {
                if (e.target.value === '') {
                  onChange('type', undefined)
                } else {
                  onChange('type', {
                    ...target?.type,
                    typeName: e.target.value
                  })
                }
              }}
              className='select select-sm'
            >
              <option value=''>{t('Using script defaults')}</option>
              {enemyTypes.map(enemy => {
                const key = getEnemyKey(enemy)
                return (
                  <option key={enemy} value={key}>
                    {t(key, { ns: 'enemy', defaultValue: key })}
                  </option>
                )
              })}
            </select>
          </div>

          {/* HP Multiplier (for enemy type) */}
          {target?.type?.typeName && (
            <div className='form-control'>
              <label className='label py-1'>
                <span className='label-text text-xs'>{t('HP Multiplier')}</span>
              </label>
              <input
                type='number'
                min='0'
                step='0.1'
                placeholder='1.0'
                value={target?.type?.hpMultiplier ?? ''}
                onChange={e =>
                  onChange('type', {
                    ...target?.type,
                    typeName: target?.type?.typeName || '',
                    hpMultiplier: e.target.value ? parseFloat(e.target.value) : undefined
                  })
                }
                className='input input-sm'
              />
            </div>
          )}

          {/* Particles (for enemy type) */}
          {target?.type?.typeName && (
            <div className='form-control'>
              <label className='label py-1'>
                <span className='label-text text-xs'>{t('Drop Particles')}</span>
              </label>
              <select
                value={
                  target?.type?.particles === undefined
                    ? ''
                    : target?.type?.particles
                    ? 'true'
                    : 'false'
                }
                onChange={e =>
                  onChange('type', {
                    ...target?.type,
                    typeName: target?.type?.typeName || '',
                    particles:
                      e.target.value === '' ? undefined : e.target.value === 'true'
                  })
                }
                className='select select-sm'
              >
                <option value=''>Default</option>
                <option value='true'>{t('Yes')}</option>
                <option value='false'>{t('No')}</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Basic Properties */}
      <div className='rounded-lg bg-base-300 p-3'>
        <div className='mb-2 text-xs font-semibold opacity-70'>Basic Properties</div>
        <div className='grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4'>
          <div className='form-control'>
            <label className='label py-1'>
              <span className='label-text text-xs'>{t('Level')}</span>
            </label>
            <input
              type='number'
              min='1'
              max='100'
              placeholder='90'
              value={target?.level ?? ''}
              onChange={e =>
                onChange('level', e.target.value ? parseInt(e.target.value) : undefined)
              }
              className='input input-sm'
            />
          </div>

          <div className='form-control'>
            <label className='label py-1'>
              <span className='label-text text-xs'>{t('HP')}</span>
            </label>
            <input
              type='number'
              min='0'
              placeholder='Auto'
              value={target?.hp ?? ''}
              onChange={e =>
                onChange('hp', e.target.value ? parseFloat(e.target.value) : undefined)
              }
              className='input input-sm'
            />
          </div>

          <div className='form-control'>
            <label className='label py-1'>
              <span className='label-text text-xs'>{t('Radius')}</span>
            </label>
            <input
              type='number'
              min='0'
              step='0.1'
              placeholder='2.0'
              value={target?.radius ?? ''}
              onChange={e =>
                onChange('radius', e.target.value ? parseFloat(e.target.value) : undefined)
              }
              className='input input-sm'
            />
          </div>

          <div className='form-control'>
            <label className='label py-1'>
              <span className='label-text text-xs'>{t('Base Resist')}</span>
            </label>
            <input
              type='number'
              step='0.01'
              placeholder='0.10'
              value={target?.resist ?? ''}
              onChange={e =>
                onChange('resist', e.target.value ? parseFloat(e.target.value) : undefined)
              }
              className='input input-sm'
            />
          </div>
        </div>
      </div>

      {/* Elemental Resistances */}
      <div className='rounded-lg bg-base-300 p-3'>
        <div className='mb-2 text-xs font-semibold opacity-70'>Elemental Resistances</div>
        <div className='grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5'>
          <div className='form-control'>
            <label className='label py-1'>
              <span className='label-text text-xs'>{t('Pyro Resist')}</span>
            </label>
            <input
              type='number'
              step='0.01'
              placeholder='0.10'
              value={target?.pyroResist ?? ''}
              onChange={e =>
                onChange('pyroResist', e.target.value ? parseFloat(e.target.value) : undefined)
              }
              className='input input-sm'
            />
          </div>

          <div className='form-control'>
            <label className='label py-1'>
              <span className='label-text text-xs'>{t('Hydro Resist')}</span>
            </label>
            <input
              type='number'
              step='0.01'
              placeholder='0.10'
              value={target?.hydroResist ?? ''}
              onChange={e =>
                onChange('hydroResist', e.target.value ? parseFloat(e.target.value) : undefined)
              }
              className='input input-sm'
            />
          </div>

          <div className='form-control'>
            <label className='label py-1'>
              <span className='label-text text-xs'>{t('Cryo Resist')}</span>
            </label>
            <input
              type='number'
              step='0.01'
              placeholder='0.10'
              value={target?.cryoResist ?? ''}
              onChange={e =>
                onChange('cryoResist', e.target.value ? parseFloat(e.target.value) : undefined)
              }
              className='input input-sm'
            />
          </div>

          <div className='form-control'>
            <label className='label py-1'>
              <span className='label-text text-xs'>{t('Electro Resist')}</span>
            </label>
            <input
              type='number'
              step='0.01'
              placeholder='0.10'
              value={target?.electroResist ?? ''}
              onChange={e =>
                onChange('electroResist', e.target.value ? parseFloat(e.target.value) : undefined)
              }
              className='input input-sm'
            />
          </div>

          <div className='form-control'>
            <label className='label py-1'>
              <span className='label-text text-xs'>{t('Anemo Resist')}</span>
            </label>
            <input
              type='number'
              step='0.01'
              placeholder='0.10'
              value={target?.anemoResist ?? ''}
              onChange={e =>
                onChange('anemoResist', e.target.value ? parseFloat(e.target.value) : undefined)
              }
              className='input input-sm'
            />
          </div>

          <div className='form-control'>
            <label className='label py-1'>
              <span className='label-text text-xs'>{t('Geo Resist')}</span>
            </label>
            <input
              type='number'
              step='0.01'
              placeholder='0.10'
              value={target?.geoResist ?? ''}
              onChange={e =>
                onChange('geoResist', e.target.value ? parseFloat(e.target.value) : undefined)
              }
              className='input input-sm'
            />
          </div>

          <div className='form-control'>
            <label className='label py-1'>
              <span className='label-text text-xs'>{t('Dendro Resist')}</span>
            </label>
            <input
              type='number'
              step='0.01'
              placeholder='0.10'
              value={target?.dendroResist ?? ''}
              onChange={e =>
                onChange('dendroResist', e.target.value ? parseFloat(e.target.value) : undefined)
              }
              className='input input-sm'
            />
          </div>

          <div className='form-control'>
            <label className='label py-1'>
              <span className='label-text text-xs'>{t('Physical Resist')}</span>
            </label>
            <input
              type='number'
              step='0.01'
              placeholder='0.10'
              value={target?.physicalResist ?? ''}
              onChange={e =>
                onChange('physicalResist', e.target.value ? parseFloat(e.target.value) : undefined)
              }
              className='input input-sm'
            />
          </div>

          <div className='form-control'>
            <label className='label py-1'>
              <span className='label-text text-xs'>{t('Freeze Resist')}</span>
            </label>
            <input
              type='number'
              step='0.01'
              placeholder='0.10'
              value={target?.freezeResist ?? ''}
              onChange={e =>
                onChange('freezeResist', e.target.value ? parseFloat(e.target.value) : undefined)
              }
              className='input input-sm'
            />
          </div>
        </div>
      </div>

      {/* Particle Settings */}
      <div className='rounded-lg bg-base-300 p-3'>
        <div className='mb-2 text-xs font-semibold opacity-70'>Particle Settings</div>
        <div className='grid grid-cols-2 gap-3 sm:grid-cols-2'>
          <div className='form-control'>
            <label className='label py-1'>
              <span className='label-text text-xs'>{t('Particle Threshold')}</span>
            </label>
            <input
              type='number'
              min='0'
              placeholder='Auto'
              value={target?.particleThreshold ?? ''}
              onChange={e =>
                onChange('particleThreshold', e.target.value ? parseInt(e.target.value) : undefined)
              }
              className='input input-sm'
            />
          </div>

          <div className='form-control'>
            <label className='label py-1'>
              <span className='label-text text-xs'>{t('Particle Drop Count')}</span>
            </label>
            <input
              type='number'
              min='0'
              placeholder='Auto'
              value={target?.particleDropCount ?? ''}
              onChange={e =>
                onChange('particleDropCount', e.target.value ? parseInt(e.target.value) : undefined)
              }
              className='input input-sm'
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default TargetSettingsSection
