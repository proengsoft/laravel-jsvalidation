@extends('app')

@section('content')
<div class="container-fluid">
	<div class="row">
		<div class="col-md-8 col-md-offset-2">
			<div class="panel panel-default">
				<div class="panel-heading">Javascrit Validation</div>
				<div class="panel-body">
					@if (count($errors) > 0)
						<div class="alert alert-danger">
							<strong>Whoops!</strong> There were some problems with your input.<br><br>
							<ul>
								@foreach ($errors->all() as $error)
									<li>{{ $error }}</li>
								@endforeach
							</ul>
						</div>
					@endif
                    {{ filter_var("htt:111", FILTER_VALIDATE_URL) }}
					<form class="form-horizontal" role="form" method="POST" action="" id="ddd">
						<input type="hidden" name="_token" value="{{ csrf_token() }}">

                        @foreach($fields as $field=>$message)
                            @if ($field == "accepted")
                            <div class="form-group">
                                <label class="col-md-4 control-label">{{$field}}</label>
                                <div class="col-md-6 col-md-offset-4">
                                    {{$message}}
                                    <div class="checkbox">
                                        <label>
                                            <input type="checkbox" name="{{$field}}" value="1">
                                        </label>
                                    </div>
                                </div>
                            </div>
                            @elseif ($field=="array")
                                <div class="form-group">
                                    <label class="col-md-4 control-label">Array</label>
                                    <div class="col-md-6">
                                        <input type="text" class="form-control" name="{{$field}}[]">
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label class="col-md-4 control-label"></label>
                                    <div class="col-md-6">
                                        <input type="text" class="form-control" name="{{$field}}[]">
                                        <p>{{$message}}</p>
                                    </div>
                                </div>
                            @elseif ($field=="confirmed_confirmation")
                                <div class="form-group">
                                    <label class="col-md-4 control-label">confirmed</label>
                                    <div class="col-md-6">
                                        <input type="password" class="form-control" name="confirmed">
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label class="col-md-4 control-label">Confirm confirmed</label>
                                    <div class="col-md-6">
                                        <input type="password" class="form-control" name="confirmed_confirmation">
                                        <p>{{$message}}</p>
                                    </div>
                                </div>
                            @else
                                <div class="form-group">
                                    <label class="col-md-4 control-label">{{snake_case($field)}}</label>
                                    <div class="col-md-6">
                                        <input class="form-control" name="{{$field}}" placeholder="{{$message}}" >
                                    </div>
                                </div>
                            @endif

                        @endforeach

						<div class="form-group">
							<div class="col-md-6 col-md-offset-4">
								<button type="submit" class="btn btn-primary" style="margin-right: 15px;">
									Login
								</button>

								<a href="/password/email">Forgot Your Password?</a>
							</div>
						</div>
					</form>
				</div>
			</div>
		</div>
	</div>
</div>
<script src="//code.jquery.com/jquery-1.11.1.min.js"></script>
    {!!$validator!!}
@endsection
