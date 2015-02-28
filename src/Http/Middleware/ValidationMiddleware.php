<?php namespace Cms\Http\Middleware;

use \Closure;

class ValidationMiddleware
{

    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request $request
     * @param  \Closure $next
     * @return mixed
     */
    public function handle($request, Closure $next)
    {
         /**
          * @var \Response $response
          */
        $response = $next($request);


        return $response;
    }

}
