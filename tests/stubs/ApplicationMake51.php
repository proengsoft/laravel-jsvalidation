<?php

/**
 * Created by PhpStorm.
 * User: Albert
 * Date: 20/09/2015
 * Time: 2:15
 */

use Illuminate\Contracts\Container\Container;

abstract class ApplicationMake implements Container
{

    /**
     * Resolve the given type from the container.
     *
     * @param  string  $abstract
     * @param  array   $parameters
     * @return mixed
     */
    public function make($abstract, array $parameters = array())
    {
        
    }

}