// SERVICES
import { setupApiClient } from "../services/api";

// OTHERS
import { WithSSRAuth } from "../utils/WithSSRAuth";

export default function Metrics() {

  return (
    <h1> Metrics </h1>
  )

}

export const getServerSideProps = WithSSRAuth(async (ctx) => {

  const apiClient = setupApiClient(ctx)

  const me = await apiClient.get('/me').then(res => res?.data || '');

  return {
    props: {

    }
  }

}, {
  permissions: ['metrics.list'],
  roles: ['administrator']
})