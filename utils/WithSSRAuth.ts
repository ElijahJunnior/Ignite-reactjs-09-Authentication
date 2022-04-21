// REACT / NEXT 
import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from "next";

// OTHES LIBS
import { destroyCookie, parseCookies } from "nookies";
import decode from 'jwt-decode';

// COMPONENTS
import { AuthTokenError } from "../errors/AuthTokenError";
import { validateUserPermissions } from "./validateUserPermissions";

type WithSSRAuthOptions = {
  permissions?: string[]
  roles?: string[]
}

// High Order Function usada para redi redirecionar usuario não autenticados ou autorizados 
export function WithSSRAuth<T>(fn: GetServerSideProps<T>, options?: WithSSRAuthOptions) {

  // retorna a função que será executada pelo Next antes da exibição das paginas com SSR
  return async (ctx: GetServerSidePropsContext): Promise<GetServerSidePropsResult<T>> => {

    // Pega os cookies disponiveis para a pagina 
    const cookies = parseCookies(ctx);

    // extra o token dos cookies
    const token = cookies['nextauth.token'];

    // redireciona os usuário sem tokem para o login 
    if (!token) {
      return {
        redirect: {
          destination: '/',
          permanent: false
        }
      }
    }

    //  verifica se a pagina exige alguma permissão
    if (options) {

      // extrai as permissões necesárias para a pagina 
      const { permissions, roles } = options;

      // decodifica, do token, as permissões que o usuário possui
      const user = decode<{ permissions: string[], roles: string[] }>(token);

      // verifica se o usuário tem as permissões exigidas pela pagina 
      const userHasValidPermissions = validateUserPermissions({
        user, permissions, roles
      });

      // redireciona os usuários não autorizados para a pagina DASHBOARD  
      if (!userHasValidPermissions) {
        return {
          redirect: {
            destination: '/dashboard',
            permanent: false
          }
        }
      }

    }

    try {

      // executa a função de SSR da pagina especifica
      return await fn(ctx);

    } catch (error) {

      // trata os erros de autenticação
      if (error instanceof AuthTokenError) {

        // destroi os cookies de autenticação
        destroyCookie(ctx, 'nextauth.token')
        destroyCookie(ctx, 'nextauth.refreshToken')

        // redireciona o usuario para o login
        return {
          redirect: {
            destination: '/',
            permanent: false
          }
        }

      }

      // caso seja outro erro encaminha o usuario para uma pagina de erro
      // elias_fazer!!!

    }

  }

}