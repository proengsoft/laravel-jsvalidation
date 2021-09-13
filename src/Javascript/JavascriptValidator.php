<?php

namespace Proengsoft\JsValidation\Javascript;

use Exception;
use Illuminate\Contracts\Support\Arrayable;
use Illuminate\Support\Facades\View;
use Proengsoft\JsValidation\Exceptions\PropertyNotFoundException;

class JavascriptValidator implements Arrayable
{
    /**
     * Registered validator instance.
     *
     * @var ValidatorHandler
     */
    protected $validator;

    /**
     * Selector used in javascript generation.
     *
     * @var string
     */
    protected $selector;

    /**
     * View that renders Javascript.
     *
     * @var
     */
    protected $view;

    /**
     * Enable or disable remote validations.
     *
     * @var bool
     */
    protected $remote;

    /**
     * 'ignore' option for jQuery Validation Plugin.
     *
     * @var string
     */
    protected $ignore;

    /**
     * Constructor.
     *
     * @param  ValidatorHandler  $validator
     * @param  array  $options
     */
    public function __construct(ValidatorHandler $validator, $options = [])
    {
        $this->validator = $validator;
        $this->setDefaults($options);
    }

    /**
     * Set default parameters.
     *
     * @param $options
     * @return void
     */
    protected function setDefaults($options)
    {
        $this->selector = empty($options['selector']) ? 'form' : $options['selector'];
        $this->view = empty($options['view']) ? 'jsvalidation::bootstrap' : $options['view'];
        $this->remote = isset($options['remote']) ? $options['remote'] : true;

        if (isset($options['ignore'])) {
            $this->ignore = $options['ignore'];
        }
    }

    /**
     * Render the specified view with validator data.
     *
     * @param  null|\Illuminate\Contracts\View\View|string  $view
     * @param  null|string  $selector
     * @return string
     */
    public function render($view = null, $selector = null)
    {
        $this->view($view);
        $this->selector($selector);

        return View::make($this->view, ['validator' => $this->getViewData()])
            ->render();
    }

    /**
     * Get the view data as an array.
     *
     * @return array
     */
    public function toArray()
    {
        return $this->getViewData();
    }

    /**
     * Get the string resulting of render default view.
     *
     * @return string
     */
    public function __toString()
    {
        try {
            return $this->render();
        } catch (Exception $exception) {
            return trigger_error($exception->__toString(), E_USER_ERROR);
        }
    }

    /**
     * Gets value from view data.
     *
     * @param $name
     * @return string
     *
     * @throws \Proengsoft\JsValidation\Exceptions\PropertyNotFoundException
     */
    public function __get($name)
    {
        $data = $this->getViewData();
        if (! array_key_exists($name, $data)) {
            throw new PropertyNotFoundException($name, get_class());
        }

        return $data[$name];
    }

    /**
     * Gets view data.
     *
     * @return array
     */
    protected function getViewData()
    {
        $this->validator->setRemote($this->remote);
        $data = $this->validator->validationData();
        $data['selector'] = $this->selector;

        if (! is_null($this->ignore)) {
            $data['ignore'] = $this->ignore;
        }

        return $data;
    }

    /**
     * Set the form selector to validate.
     *
     * @param  string  $selector
     *
     * @deprecated
     */
    public function setSelector($selector)
    {
        $this->selector = $selector;
    }

    /**
     * Set the form selector to validate.
     *
     * @param  string  $selector
     * @return \Proengsoft\JsValidation\Javascript\JavascriptValidator
     */
    public function selector($selector)
    {
        $this->selector = is_null($selector) ? $this->selector : $selector;

        return $this;
    }

    /**
     * Set the input selector to ignore for validation.
     *
     * @param  string  $ignore
     * @return \Proengsoft\JsValidation\Javascript\JavascriptValidator
     */
    public function ignore($ignore)
    {
        $this->ignore = $ignore;

        return $this;
    }

    /**
     * Set the view to render Javascript Validations.
     *
     * @param  null|\Illuminate\Contracts\View\View|string  $view
     * @return \Proengsoft\JsValidation\Javascript\JavascriptValidator
     */
    public function view($view)
    {
        $this->view = is_null($view) ? $this->view : $view;

        return $this;
    }

    /**
     * Enables or disables remote validations.
     *
     * @param  null|bool  $enabled
     * @return \Proengsoft\JsValidation\Javascript\JavascriptValidator
     */
    public function remote($enabled = true)
    {
        $this->remote = $enabled;

        return $this;
    }

    /**
     * Validate Conditional Validations using Ajax in specified fields.
     *
     * @param  string  $attribute
     * @param  string|array  $rules
     * @param  null  $callback  Dummy attribute to make API seamless with Laravel sometimes()
     * @return \Proengsoft\JsValidation\Javascript\JavascriptValidator
     */
    public function sometimes($attribute, $rules, $callback = null)
    {
        $this->validator->sometimes($attribute, $rules);

        return $this;
    }
}
