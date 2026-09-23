# Abstract AR base. Concrete models live in app/models.

class ApplicationRecord < ActiveRecord::Base
  primary_abstract_class
end
