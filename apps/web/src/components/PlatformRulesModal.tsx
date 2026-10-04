import React from 'react'
import { X, Scale, FileText } from 'lucide-react'

import { useScrollLock } from '../hooks/useScrollLock'

interface PlatformRulesModalProps {
  isOpen: boolean
  onClose: () => void
  type: 'user' | 'business'
}

export const PlatformRulesModal: React.FC<PlatformRulesModalProps> = ({
  isOpen,
  onClose,
  type,
}) => {
  useScrollLock(isOpen)

  if (!isOpen) return null


  const userRules = (
    <div className="space-y-4 text-xs text-gray-300 leading-relaxed">
      <p>
        <strong>1. Общие положения:</strong> Настоящие Правила пользования платформой (далее — «Правила») регулируют отношения между Пользователем и Платформой при поиске и заказе услуг.
      </p>
      <p>
        <strong>2. Права и Обязанности Пользователя:</strong>
        <br />— Пользователь обязуется предоставлять достоверную информацию при оформлении заявок.
        <br />— Пользователь имеет право на получение услуг надлежащего качества в сроки, оговоренные в чате сделки.
        <br />— Запрещено использование Платформы для организации незаконной деятельности, обмана или мошенничества.
      </p>
      <p>
        <strong>3. Безопасность и Арбитраж:</strong>
        <br />Платформа предоставляет систему внутреннего арбитража. В случае возникновения споров с исполнителем, Пользователь вправе открыть диспут. 
        <br /><em>Внимание:</em> Платформа не несет ответственности и не может гарантировать разрешение споров, если коммуникация и договоренности велись за пределами внутреннего чата.
      </p>
      <p>
        <strong>4. Конфиденциальность данных:</strong>
        <br />Сбор и обработка персональных данных осуществляются в соответствии с международными стандартами (GDPR). Платформа обязуется не передавать данные третьим лицам без согласия Пользователя.
      </p>
      <p>
        <strong>5. Ограничение ответственности:</strong>
        <br />Платформа выступает в роли информационного посредника. Исполнители несут самостоятельную ответственность за качество и законность оказываемых услуг.
      </p>
    </div>
  )

  const businessRules = (
    <div className="space-y-4 text-xs text-gray-300 leading-relaxed">
      <p>
        <strong>1. Предмет соглашения:</strong> Настоящие Правила ведения бизнеса определяют условия взаимодействия между Платформой и авторизованным Исполнителем (далее — «Бизнес» или «PRO»).
      </p>
      <p>
        <strong>2. Требования к Бизнесу:</strong>
        <br />— Бизнес гарантирует наличие всех необходимых лицензий и разрешений для осуществления своей деятельности в соответствии с местным законодательством.
        <br />— Строго запрещено предоставление услуг, противоречащих нормам международного права.
      </p>
      <p>
        <strong>3. Обязательства перед Клиентом:</strong>
        <br />— Бизнес обязуется выполнять взятые на себя обязательства в полном объеме.
        <br />— Запрещается использование вводящей в заблуждение рекламы или указание недостоверных характеристик товаров/услуг в заявках и откликах.
      </p>
      <p>
        <strong>4. Система Арбитража и Санкции:</strong>
        <br />— Платформа оставляет за собой право блокировать аккаунт Бизнеса в случае систематических нарушений, жалоб от пользователей или выявления мошеннических схем.
        <br />— При открытии диспута Бизнес обязан содействовать модераторам Платформы и предоставлять доказательства (в т.ч. переписку во внутреннем чате).
      </p>
      <p>
        <strong>5. Интеллектуальная собственность:</strong>
        <br />Бизнес гарантирует, что размещаемые им материалы (логотипы, фотографии) не нарушают авторские права третьих лиц. Платформа вправе удалять спорный контент.
      </p>
    </div>
  )

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn overscroll-contain">
      <div className="w-full max-w-lg bg-[#0D1117] border border-cyan-500/40 rounded-3xl p-5 sm:p-6 shadow-[0_0_30px_rgba(0,242,254,0.15)] relative overflow-hidden max-h-[85dvh] flex flex-col overscroll-contain">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 shrink-0">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-cyan-400" />
            <h3 className="font-extrabold text-sm sm:text-base text-white uppercase tracking-wide">
              {type === 'user' ? 'Правила пользования Платформой' : 'Правила ведения бизнеса (PRO)'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain mt-4 pr-2 custom-scrollbar">
          {type === 'user' ? userRules : businessRules}
        </div>

        {/* Footer */}
        <div className="border-t border-white/10 pt-4 mt-4 shrink-0 text-center">
          <p className="text-[10px] text-gray-500 flex items-center justify-center gap-1.5">
            <FileText className="w-3.5 h-3.5" />
            Последнее обновление: Октябрь 2026. Разработано в соответствии с международным правом.
          </p>
        </div>
      </div>
    </div>
  )
}
