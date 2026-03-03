
import React from 'react';
import {
    Hammer,
    Truck,
    Palette,
    Armchair,
    Layout,
    MessageSquare,
    Search,
    Briefcase,
    Eye,
    Factory
} from 'lucide-react';

export const PLATFORM_SERVICES = [
    {
        id: '00000000-0000-0000-0000-000000000001',
        name_ar: 'خدمات التوريد والتصنيع',
        name_en: 'Supply & Manufacturing',
        description_ar: 'نقدم خدمات توريد الخامات وتصنيع الأثاث المخصص بأعلى معايير الجودة.',
        description_en: 'We provide materials supply and custom furniture manufacturing with high standards.',
        icon: Factory,
        color: '#E2B13C'
    },
    {
        id: '00000000-0000-0000-0000-000000000002',
        name_ar: 'خدمات التصميم',
        name_en: 'Design Services',
        description_ar: 'تصميم داخلي مبتكر يجمع بين الجمال والوظيفة لاستغلال كل زاوية في مساحتكم.',
        description_en: 'Innovative interior design combining beauty and function for your space.',
        icon: Palette,
        color: '#E2B13C'
    },
    {
        id: '00000000-0000-0000-0000-000000000003',
        name_ar: 'خدمات التأثيث',
        name_en: 'Furnishing Services',
        description_ar: 'تنسيق واختيار الأثاث والإكسسوارات لتكمل رؤيتكم الجمالية.',
        description_en: 'Coordination and selection of furniture and accessories to complete your vision.',
        icon: Armchair,
        color: '#E2B13C'
    },
    {
        id: '00000000-0000-0000-0000-000000000004',
        name_ar: 'أعمال التنفيذ',
        name_en: 'Implementation Works',
        description_ar: 'تنفيذ التصاميم على أرض الواقع بدقة متناهية وإشراف هندسي متكامل.',
        description_en: 'Realizing designs on the ground with extreme precision and full engineering supervision.',
        icon: Hammer,
        color: '#E2B13C'
    },
    {
        id: '00000000-0000-0000-0000-000000000005',
        name_ar: 'خدمات الاستشارات',
        name_en: 'Consulting Services',
        description_ar: 'استشارات مهنية متخصصة لمساعدتكم في اتخاذ أفضل القرارات لمساحتكم.',
        description_en: 'Professional specialized consulting to help you make the best decisions for your space.',
        icon: MessageSquare,
        color: '#E2B13C'
    },
    {
        id: '00000000-0000-0000-0000-000000000006',
        name_ar: 'تشخيص مشاريع',
        name_en: 'Project Diagnosis',
        description_ar: 'دراسة حالة المساحات وتقديم الحلول الفنية والجمالية المناسبة.',
        description_en: 'Studying spaces cases and providing appropriate technical and aesthetic solutions.',
        icon: Search,
        color: '#E2B13C'
    },
    {
        id: '00000000-0000-0000-0000-000000000007',
        name_ar: 'إدارة مشاريع',
        name_en: 'Project Management',
        description_ar: 'إدارة متكاملة لجميع مراحل المشروع من الفكرة حتى التسليم النهائي.',
        description_en: 'Integrated management of all project stages from idea to final delivery.',
        icon: Briefcase,
        color: '#E2B13C'
    },
    {
        id: '00000000-0000-0000-0000-000000000008',
        name_ar: 'إشراف مشاريع',
        name_en: 'Project Supervision',
        description_ar: 'إشراف ميداني دقيق لضمان مطابقة التنفيذ لأعلى معايير الجودة والمواصفات.',
        description_en: 'Scrupulous field supervision to ensure implementation matches highest quality standards.',
        icon: Eye,
        color: '#E2B13C'
    }
];

export const ServiceIcon = ({ icon: Icon, color, size = 24, framed = true }) => {
    if (!Icon) return null;

    if (!framed) return <Icon size={size} color={color} />;

    return (
        <div
            className="flex items-center justify-center rounded-2xl border-2 transition-all duration-300"
            style={{
                width: size * 2,
                height: size * 2,
                borderColor: `${color}40`,
                backgroundColor: `${color}10`,
                color: color
            }}
        >
            <Icon size={size} strokeWidth={2.5} />
        </div>
    );
};
