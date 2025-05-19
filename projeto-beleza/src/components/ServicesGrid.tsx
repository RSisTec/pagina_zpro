import React from 'react';
import ServiceCard from '../components/Card/ServiceCard';

const services = [
  {
    title: 'MICRO DE SOBRANCELHA',
    price: 'R$ 419,00',
    duration: '120min',
    description: 'Micropigmentação de sobrancelha para um visual natural e duradouro.'
  },
  {
    title: 'MICRO LABIAL',
    price: 'R$ 389,90',
    duration: '120min',
    description: 'Micropigmentação labial para realçar a cor e definição dos lábios.'
  },
  {
    title: 'COMBO MICROPIGMENTAÇÃO',
    price: 'R$ 789,90',
    duration: '150min',
    description: 'Combo completo incluindo micropigmentação de sobrancelha e labial com preço especial.'
  },
  {
    title: 'PIERCING',
    price: 'Consultar',
    duration: '30min',
    description: 'Aplicação de piercing com joias disponíveis para consulta.'
  },
  {
    title: 'BROW LAMINATION',
    price: 'R$ 130,00',
    duration: '90min',
    description: 'Técnica que alinha e fixa os fios da sobrancelha, criando um efeito natural e volumoso.'
  },
  {
    title: 'HENNA + SPA LABIAL',
    price: 'R$ 70,00',
    duration: '60min',
    description: 'Combinação de design com henna e tratamento especial para os lábios.'
  },
  {
    title: 'DESIGN COM HENNA',
    price: 'R$ 49,90',
    duration: '60min',
    description: 'Design de sobrancelha com aplicação de henna para um efeito mais marcado.'
  },
  {
    title: 'DESIGN SEM HENNA',
    price: 'R$ 35,00',
    duration: '30min',
    description: 'Design de sobrancelha tradicional para realçar o olhar.'
  },
  {
    title: 'FURO HUMANIZADO',
    price: 'R$ 180,00',
    duration: '59min',
    description: 'Técnica de perfuração com abordagem mais suave e confortável.'
  },
  {
    title: 'RETOQUE MICROPIGMENTAÇÃO SOBRANCELHA',
    price: 'R$ 160,00',
    duration: '60min',
    description: 'Retoque para manter a micropigmentação de sobrancelha sempre perfeita.'
  }
];

const ServicesGrid: React.FC = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {services.map((service, index) => (
        <ServiceCard
          key={index}
          title={service.title}
          price={service.price}
          duration={service.duration}
          description={service.description}
        />
      ))}
    </div>
  );
};

export default ServicesGrid;
