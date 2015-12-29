<?php

namespace Proengsoft\JsValidation\Javascript;

use Illuminate\Contracts\Support\Arrayable;
use Illuminate\Support\Facades\View;
use Proengsoft\JsValidation\Exceptions\PropertyNotFoundException;

class JavascriptValidator implements Arrayable
{
    /**
     * Registered validator instance.
     *
     * @var \Proengsoft\JsValidation\Javascript\ValidatorHandler
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
     * @param ValidatorHandler $validator
     * @param array               $options
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
     */
    protected function setDefaults($options)
    {
        $this->selector = empty($options['selector']) ? 'form' : $options['selector'];
        $this->view = empty($options['view']) ? 'jsvalidation::bootstrap' : $options['view'];
        $this->remote = empty($options['remote']) ? true : $options['remote'];
    }

    /**
     * Render the specified view with validator data.
     *
     * @param \Illuminate\Contracts\View\View|string|null $view
     * @param string|null                                 $selector
     *
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
        return $this->render();
    }

    /**
     * Gets value from view data.
     *
     * @param $name
     *
     * @return string
     *
     * @throws PropertyNotFoundException
     */
    public function __get($name)
    {
        $data = $this->getViewData();
        if (array_key_exists($name, $data)) {
            return $data[$name];
        } else {
            throw new PropertyNotFoundException($name, get_class());
        }
    }

    /**
     *  Gets view data.
     *
     * @return array
     */
    protected function getViewData()
    {
        $data = $this->validator->validationData($this->remote);
        $data['selector'] = $this->selector;

        if (! is_null($this->ignore)) {
            $data['ignore'] = $this->ignore;
        }

        return $data;
    }

    /**
     * Set the form selector to validate.
     *
     * @param string $selector
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
     * @param string $selector
     *
     * @return JavascriptValidator
     */
    public function selector($selector)
    {
        $this->selector = is_null($selector) ? $this->selector : $selector;

        return $this;
    }

    /**
     * Set the input selector to ignore for validation.
     *
     * @param string $ignore
     *
     * @return JavascriptValidator
     */
    public function ignore($ignore)
    {
        $this->ignore = $ignore;

        return $this;
    }

    /**
     * Set the view to render Javascript Validations.
     *
     * @param \Illuminate\Contracts\View\View|string|null $view
     *
     * @return JavascriptValidator
     */
    public function view($view)
    {
        $this->view = is_null($view) ? $this->view : $view;

        return $this;
    }

    /**
     * Enables or disables remote validations.
     *
     * @param bool|null $enabled
     *
     * @return JavascriptValidator
     */
    public function remote($enabled = true)
    {
        $this->remote = $enabled;

        return $this;
    }
}
