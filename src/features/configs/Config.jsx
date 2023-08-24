import { useTranslation } from "react-i18next";
import classNames from "classnames";
import useQueryParams from "../../hooks/useQueryParams";
import AttributeWeights from "./AttributeWeights";
import RarityWeights from "./RarityWeights";
import Others from "./Others";

const Config = () => {
  const { t } = useTranslation();
  const [tab, setTab] = useQueryParams([{ name: 'tab', defaultValue: 1, isNumeric: true}])
  return (
    <div className="flex w-full flex-col items-center justify-center">
      <div className="flex w-full flex-col items-center justify-center">
        <div className="tabs tabs-boxed rounded-b-none">
          <a className={classNames('tab', {'tab-active': tab === 1})} onClick={() => setTab(1)}>{t('Stats Weight')}</a>
          <a className={classNames('tab', {'tab-active': tab === 2})} onClick={() => setTab(2)}>{t('Rarity Weight')}</a>
          <a className={classNames('tab', {'tab-active': tab === 3})} onClick={() => setTab(3)}>{t('Others')}</a>
        </div>
        <div className="flex w-full flex-col items-center justify-center bg-base-200 sm:w-3/4 md:w-1/2 rounded-2xl p-2 md:p-4">
          {tab === 1 && <AttributeWeights />}
          {tab === 2 && <RarityWeights />}
          {tab === 3 && <Others />}
        </div>
      </div>
    </div>
  );
};

export default Config;
