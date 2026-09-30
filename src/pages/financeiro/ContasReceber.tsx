import { ContasModule } from './ContasModule'

export default function ContasReceber() {
  return (
    <ContasModule
      table="contas_receber"
      title="Contas a Receber"
      description="Acompanhe os recebimentos previstos e realizados."
      partyLabel="Cliente"
      partyField="cliente"
    />
  )
}
