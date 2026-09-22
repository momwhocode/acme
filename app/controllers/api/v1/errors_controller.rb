module Api
  module V1
    class ErrorsController < ActionController::API
      include ExceptionHandler

      def show
        exception = request.get_header("action_dispatch.exception")
        raise exception if exception

        handle_not_found(nil)
      end
    end
  end
end
